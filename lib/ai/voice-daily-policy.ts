/** Local candidate only: not yet connected to admission, routes, agents or a live Redis. */
export const VOICE_DAILY_LIMIT = 3;
export const VOICE_MAX_DURATION_SECONDS = 360;

const madridClock = new Intl.DateTimeFormat('en-GB-u-ca-gregory-nu-latn', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

function civilParts(epochMs: number) {
  const parts = Object.fromEntries(madridClock.formatToParts(epochMs)
    .filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day),
    hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second) };
}

function civilUtc(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  // setUTCFullYear avoids Date.UTC's special interpretation of years 0..99.
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, 0);
  return date.getTime();
}

function madridMidnight(year: number, month: number, day: number) {
  const wallClock = civilUtc(year, month, day);
  let candidate = wallClock;
  for (let i = 0; i < 5; i++) {
    const observed = civilParts(candidate);
    const offset = civilUtc(observed.year, observed.month, observed.day,
      observed.hour, observed.minute, observed.second) - candidate;
    const corrected = wallClock - offset;
    if (corrected === candidate) {
      if (observed.year !== year || observed.month !== month || observed.day !== day ||
          observed.hour !== 0 || observed.minute !== 0 || observed.second !== 0) break;
      return candidate / 1000;
    }
    candidate = corrected;
  }
  throw new RangeError('invalid_madrid_day');
}

/** Epoch-second boundaries for a natural Madrid day; never a rolling 24-hour window. */
export function madridVoiceDay(nowMs: number): { date: string; startsAt: number; endsAt: number } {
  if (typeof nowMs !== 'number' || !Number.isFinite(nowMs) ||
      nowMs < 0 || nowMs > 253402297199999) throw new RangeError('invalid_madrid_day');
  const current = civilParts(nowMs);
  if (!Number.isInteger(current.year) || current.year < 1970 || current.year > 9999) {
    throw new RangeError('invalid_madrid_day');
  }
  const next = new Date(civilUtc(current.year, current.month, current.day + 1));
  const startsAt = madridMidnight(current.year, current.month, current.day);
  const endsAt = madridMidnight(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
  const seconds = nowMs / 1000;
  if (!Number.isSafeInteger(startsAt) || !Number.isSafeInteger(endsAt) ||
      seconds < startsAt || seconds >= endsAt || endsAt - startsAt < 23 * 3600 ||
      endsAt - startsAt > 25 * 3600) throw new RangeError('invalid_madrid_day');
  const date = `${current.year.toString().padStart(4, '0')}-${current.month.toString().padStart(2, '0')}-${current.day.toString().padStart(2, '0')}`;
  return { date, startsAt, endsAt };
}

/**
 * Server-internal day-slot ledger; rate limits on attempts are separate and never refunded.
 * KEYS[1]: one private HASH for the authenticated user's HMAC and Madrid date.
 * ARGV: operation, 32-character lower-case hex nonce, start/end epoch seconds, optional hold 1..60s.
 * Fields: nonce -> p:<expiry> (pending), c (committed), x (cancelled).
 * Returns {code,retrySeconds}: 1 success (including live pending replay), 2 already committed
 * (NEVER issue another token), 0 denied/inactive/cancelled/missing; -1 invalid input/corrupt ledger.
 * A valid but not-current calendar window returns {0,1}, without touching the ledger.
 * Replayed pending reservations do not refresh their expiry or the key TTL.
 * A committed field cannot be cancelled. Cancellation never decrements an aggregate counter.
 * Both logical validation and a 20-field bound precede mutations. Lua execution is atomic,
 * but an unexpected Redis command/ACL failure is NOT a rollback transaction: fail closed.
 * This candidate has unit/static checks; real Lua-engine verification remains a separate step.
 */
export const VOICE_DAY_LEDGER_LUA = `
local function invalid() return {-1, 0} end
local function uint(value)
  if type(value) ~= 'string' or #value > 12 or not string.match(value, '^%d+$') then return nil end
  local number = tonumber(value)
  if not number or number < 0 or number > 253402300800 or number ~= math.floor(number) then return nil end
  return number
end
if #KEYS ~= 1 or type(KEYS[1]) ~= 'string' or #KEYS[1] < 1 or #KEYS[1] > 512 or
   #ARGV < 4 or #ARGV > 5 then return invalid() end
local operation = ARGV[1]
local nonce = ARGV[2]
if (operation ~= 'reserve' and operation ~= 'commit' and operation ~= 'cancel') or
   type(nonce) ~= 'string' or #nonce ~= 32 or not string.match(nonce, '^[a-f0-9]+$') then return invalid() end
local startsAt = uint(ARGV[3])
local endsAt = uint(ARGV[4])
local hold = 30
if ARGV[5] and ARGV[5] ~= '' then hold = uint(ARGV[5]) end
if not startsAt or not endsAt or not hold or hold < 1 or hold > 60 or
   endsAt - startsAt < 82800 or endsAt - startsAt > 90000 then return invalid() end
local time = redis.call('TIME')
local now = tonumber(time[1])
if not now or now < startsAt or now >= endsAt then return {0, 1} end
local kind = redis.call('TYPE', KEYS[1])
if type(kind) == 'table' then kind = kind.ok end
if kind ~= 'none' and kind ~= 'hash' then return invalid() end
local size = redis.call('HLEN', KEYS[1])
if size > 20 then return invalid() end
local fields = redis.call('HGETALL', KEYS[1])
if #fields ~= size * 2 then return invalid() end
local committed = 0
local pending = 0
local earliest = endsAt
local own = nil
local ownExpiry = nil
for i = 1, #fields, 2 do
  local field = fields[i]
  local value = fields[i + 1]
  if type(field) ~= 'string' or #field ~= 32 or not string.match(field, '^[a-f0-9]+$') then return invalid() end
  local expires = nil
  if value == 'c' then
    committed = committed + 1
  elseif value == 'x' then
    -- Cancellation is a terminal tombstone, not permission to reserve the same nonce again.
  elseif type(value) == 'string' and string.sub(value, 1, 2) == 'p:' then
    expires = uint(string.sub(value, 3))
    if not expires or expires <= startsAt or expires > endsAt then return invalid() end
    if expires > now then pending = pending + 1; earliest = math.min(earliest, expires) end
  else return invalid() end
  if field == nonce then own = value; ownExpiry = expires end
end
if committed + pending > 3 then return invalid() end
if own == 'c' then return {2, 0} end
if own == 'x' then return {0, 0} end
if operation == 'reserve' then
  if own then return ownExpiry > now and {1, 0} or {0, 0} end
  if committed + pending >= 3 then return {0, math.max(1, earliest - now)} end
  if size >= 20 then return invalid() end
  local expires = math.min(endsAt, now + hold)
  redis.call('HSET', KEYS[1], nonce, 'p:' .. string.format('%.0f', expires))
  redis.call('EXPIREAT', KEYS[1], endsAt)
  return {1, 0}
end
if not own then return {0, 0} end
if operation == 'commit' then
  if ownExpiry <= now then return {0, 0} end
  redis.call('HSET', KEYS[1], nonce, 'c')
  return {1, 0}
end
redis.call('HSET', KEYS[1], nonce, 'x')
return {1, 0}
`;
