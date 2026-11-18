const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const repoRoot = process.env.VOICE_POLICY_REPO_ROOT || path.resolve(__dirname, '..');
const sourceRoot = process.env.VOICE_POLICY_SOURCE_ROOT || repoRoot;
const ts = require(path.join(repoRoot, 'node_modules/typescript'));
const relative = 'lib/ai/voice-daily-policy.ts';
const sourcePath = [path.join(sourceRoot, relative), path.join(repoRoot, relative)].find(file => fs.existsSync(file));
const source = fs.readFileSync(sourcePath, 'utf8');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2022 } }).outputText, { exports: exportsObject, Intl, Date, RangeError,
  Number, Object, Math, require: id => { throw Error('Unexpected dependency ' + id); } });
const { VOICE_DAILY_LIMIT, VOICE_MAX_DURATION_SECONDS, madridVoiceDay, VOICE_DAY_LEDGER_LUA } = exportsObject;
const day = instant => madridVoiceDay(Date.parse(instant));
const iso = seconds => new Date(seconds * 1000).toISOString();

test('the definitive policy is three conversations per natural Madrid day and 360 seconds', () => {
  assert.equal(VOICE_DAILY_LIMIT, 3);
  assert.equal(VOICE_MAX_DURATION_SECONDS, 360);
});

test('winter day has Madrid midnight boundaries rather than a rolling 24-hour period', () => {
  const result = day('2026-11-01T20:00:00.123Z');
  assert.equal(result.date, '2026-11-01');
  assert.equal(iso(result.startsAt), '2026-10-31T23:00:00.000Z');
  assert.equal(iso(result.endsAt), '2026-11-01T23:00:00.000Z');
  assert.equal(result.endsAt - result.startsAt, 86400);
});

test('summer midnight uses UTC+2 and the day key changes at Madrid midnight', () => {
  const before = day('2026-07-15T21:59:59.999Z');
  const midnight = day('2026-07-15T22:00:00.000Z');
  assert.equal(before.date, '2026-07-15');
  assert.equal(midnight.date, '2026-07-16');
  assert.equal(before.endsAt, midnight.startsAt);
  assert.equal(iso(midnight.startsAt), '2026-07-15T22:00:00.000Z');
  assert.equal(iso(midnight.endsAt), '2026-07-16T22:00:00.000Z');
});

test('spring DST change produces a 23-hour day with the same boundaries on both sides of the jump', () => {
  const before = day('2026-03-29T00:59:59.999Z');
  const after = day('2026-03-29T01:00:00.000Z');
  assert.equal(before.date, '2026-03-29');
  assert.equal(before.startsAt, after.startsAt);
  assert.equal(before.endsAt, after.endsAt);
  assert.equal(iso(before.startsAt), '2026-03-28T23:00:00.000Z');
  assert.equal(iso(before.endsAt), '2026-03-29T22:00:00.000Z');
  assert.equal(before.endsAt - before.startsAt, 23 * 3600);
});

test('autumn DST change produces a 25-hour day and repeated local times share a quota', () => {
  const first = day('2026-10-25T00:30:00.000Z');
  const repeated = day('2026-10-25T01:30:00.000Z');
  assert.equal(first.date, '2026-10-25');
  assert.equal(first.startsAt, repeated.startsAt);
  assert.equal(first.endsAt, repeated.endsAt);
  assert.equal(iso(first.startsAt), '2026-10-24T22:00:00.000Z');
  assert.equal(iso(first.endsAt), '2026-10-25T23:00:00.000Z');
  assert.equal(first.endsAt - first.startsAt, 25 * 3600);
});

test('winter midnight, year rollover and leap days preserve adjacent calendar boundaries', () => {
  for (const [before, after, previousDate, nextDate] of [
    ['2026-11-01T22:59:59.999Z', '2026-11-01T23:00:00.000Z', '2026-11-01', '2026-11-02'],
    ['2026-12-31T22:59:59.999Z', '2026-12-31T23:00:00.000Z', '2026-12-31', '2027-01-01'],
    ['2028-02-28T22:59:59.999Z', '2028-02-28T23:00:00.000Z', '2028-02-28', '2028-02-29'],
    ['2028-02-29T22:59:59.999Z', '2028-02-29T23:00:00.000Z', '2028-02-29', '2028-03-01'],
  ]) {
    const a = day(before), b = day(after);
    assert.equal(a.date, previousDate); assert.equal(b.date, nextDate); assert.equal(a.endsAt, b.startsAt);
  }
});

test('invalid or unsupported timestamps are rejected with a generic error', () => {
  for (const input of [undefined, null, '', '2026-11-01', NaN, Infinity, -Infinity, -1,
    8640000000000001, 253402300800000, {}, new Date()]) {
    assert.throws(() => madridVoiceDay(input), error => error.name === 'RangeError' && error.message === 'invalid_madrid_day');
  }
});

test('the calendar is explicitly Madrid and has no process-local date operations or dependencies', () => {
  assert.match(source, /timeZone: 'Europe\/Madrid'/);
  assert.doesNotMatch(source, /\.(?:getFullYear|getMonth|getDate|setHours|setDate|getHours)\(/);
  assert.doesNotMatch(source, /^import\s/m);
});

test('Lua contract is a bounded private day ledger with server time and no aggregate refunds', () => {
  assert.equal(typeof VOICE_DAY_LEDGER_LUA, 'string');
  assert.match(VOICE_DAY_LEDGER_LUA, /redis\.call\('TIME'\)/);
  assert.match(VOICE_DAY_LEDGER_LUA, /redis\.call\('HLEN', KEYS\[1\]\)/);
  assert.match(VOICE_DAY_LEDGER_LUA, /size > 20/);
  assert.match(VOICE_DAY_LEDGER_LUA, /redis\.call\('HGETALL', KEYS\[1\]\)/);
  assert.match(VOICE_DAY_LEDGER_LUA, /redis\.call\('EXPIREAT', KEYS\[1\], endsAt\)/);
  assert.match(VOICE_DAY_LEDGER_LUA, /committed \+ pending >= 3/);
  assert.match(VOICE_DAY_LEDGER_LUA, /own == 'c' then return \{2, 0\}/);
  assert.doesNotMatch(VOICE_DAY_LEDGER_LUA, /redis\.(?:call|pcall)\('(?:DECR|INCR|DEL|SCAN|FLUSHALL|FLUSHDB|EVAL)'/);
  const commands = Array.from(VOICE_DAY_LEDGER_LUA.matchAll(/redis\.call\('([^']+)'/g), item => item[1]);
  assert.deepEqual([...new Set(commands)].sort(), ['EXPIREAT', 'HGETALL', 'HLEN', 'HSET', 'TIME', 'TYPE']);
  // These are source/contract guards, not a claim that a Lua engine was executed.
});

// ---- Natural Madrid weeks (Monday 00:00 to Monday 00:00), used by the weekly voice minutes ----------------------------
const { madridVoiceWeek } = exportsObject;
const week = instant => madridVoiceWeek(Date.parse(instant));

test('a week runs Monday 00:00 to the next Monday 00:00 in Madrid, whatever day inside it', () => {
  for (const instant of ['2026-11-16T00:00:00Z', '2026-11-18T12:00:00Z', '2026-11-22T22:59:59Z']) {
    const result = week(instant);
    assert.equal(iso(result.startsAt), '2026-11-15T23:00:00.000Z'); assert.equal(iso(result.endsAt), '2026-11-22T23:00:00.000Z');
  }
  // Sunday 23:00 UTC is already Monday 00:00 in Madrid: a new week.
  assert.equal(iso(week('2026-11-22T23:00:00Z').startsAt), '2026-11-22T23:00:00.000Z');
});

test('weeks that change the clock are 167 or 169 hours long, never a rolling 7 x 24', () => {
  const spring = week('2027-03-25T12:00:00Z'); // clocks go forward on Sunday 28 March 2027
  assert.equal(iso(spring.startsAt), '2027-03-21T23:00:00.000Z'); assert.equal(iso(spring.endsAt), '2027-03-28T22:00:00.000Z');
  assert.equal((spring.endsAt - spring.startsAt) / 3600, 167);
  const autumn = week('2026-10-22T12:00:00Z'); // clocks go back on Sunday 25 October 2026
  assert.equal(iso(autumn.startsAt), '2026-10-18T22:00:00.000Z'); assert.equal(iso(autumn.endsAt), '2026-10-25T23:00:00.000Z');
  assert.equal((autumn.endsAt - autumn.startsAt) / 3600, 169);
});

test('week boundaries cross month and year ends and reject impossible instants', () => {
  assert.equal(iso(week('2026-12-31T12:00:00Z').startsAt), '2026-12-27T23:00:00.000Z');
  assert.equal(iso(week('2026-12-31T12:00:00Z').endsAt), '2027-01-03T23:00:00.000Z');
  for (const bad of [NaN, Infinity, -1, '2026-11-16']) assert.throws(() => madridVoiceWeek(bad), RangeError);
});

const { madridVoicePeriod } = exportsObject;
const period = (instant, kind) => madridVoicePeriod(Date.parse(instant), kind);
const bounds = result => [iso(result.startsAt), iso(result.endsAt)];

test('a month is the natural Madrid calendar month, from the 1st at 00:00 to the next 1st at 00:00', () => {
  for (const instant of ['2026-10-31T23:00:00Z', '2026-11-16T12:00:00Z', '2026-11-30T22:59:59Z']) {
    assert.deepEqual(bounds(period(instant, 'month')), ['2026-10-31T23:00:00.000Z', '2026-11-30T23:00:00.000Z'], instant);
  }
  // 23:00 UTC on the 30th is already 1 December, 00:00 in Madrid: a new month.
  assert.deepEqual(bounds(period('2026-11-30T23:00:00Z', 'month')), ['2026-11-30T23:00:00.000Z', '2026-12-31T23:00:00.000Z']);
});

test('months follow the clock changes and the calendar: March is 743 hours, October 745, February leaps, December crosses the year', () => {
  const march = period('2027-03-15T12:00:00Z', 'month'); // summer time starts on Sunday 28 March 2027
  assert.deepEqual(bounds(march), ['2027-02-28T23:00:00.000Z', '2027-03-31T22:00:00.000Z']); assert.equal((march.endsAt - march.startsAt) / 3600, 743);
  const october = period('2027-10-15T12:00:00Z', 'month'); // summer time ends on Sunday 31 October 2027
  assert.deepEqual(bounds(october), ['2027-09-30T22:00:00.000Z', '2027-10-31T23:00:00.000Z']); assert.equal((october.endsAt - october.startsAt) / 3600, 745);
  const leap = period('2028-02-10T12:00:00Z', 'month');
  assert.deepEqual(bounds(leap), ['2028-01-31T23:00:00.000Z', '2028-02-29T23:00:00.000Z']); assert.equal((leap.endsAt - leap.startsAt) / 3600, 29 * 24);
  const plain = period('2027-02-10T12:00:00Z', 'month'); assert.equal((plain.endsAt - plain.startsAt) / 3600, 28 * 24);
  assert.deepEqual(bounds(period('2026-12-31T12:00:00Z', 'month')), ['2026-11-30T23:00:00.000Z', '2026-12-31T23:00:00.000Z']);
  assert.deepEqual(bounds(period('2027-01-01T00:30:00Z', 'month')), ['2026-12-31T23:00:00.000Z', '2027-01-31T23:00:00.000Z']);
});

test('a fortnight is a 14-day block counted from Monday 16 November 2026, before and after that date', () => {
  assert.deepEqual(bounds(period('2026-11-16T12:00:00Z', 'fortnight')), ['2026-11-15T23:00:00.000Z', '2026-11-29T23:00:00.000Z']);
  assert.deepEqual(bounds(period('2026-11-29T22:59:00Z', 'fortnight')), ['2026-11-15T23:00:00.000Z', '2026-11-29T23:00:00.000Z']);
  assert.deepEqual(bounds(period('2026-11-29T23:00:00Z', 'fortnight')), ['2026-11-29T23:00:00.000Z', '2026-12-13T23:00:00.000Z']);
  // Before the reference Monday the blocks keep the same rhythm.
  assert.deepEqual(bounds(period('2026-11-10T12:00:00Z', 'fortnight')), ['2026-11-01T23:00:00.000Z', '2026-11-15T23:00:00.000Z']);
  // Across a clock change the block is 335 or 337 hours, never 336 by rolling time.
  const spring = period('2027-03-24T12:00:00Z', 'fortnight');
  assert.ok([335, 336, 337].includes((spring.endsAt - spring.startsAt) / 3600));
  for (const instant of ['2026-11-16T12:00:00Z', '2027-03-24T12:00:00Z', '2027-10-20T12:00:00Z', '2030-06-01T12:00:00Z']) {
    const block = period(instant, 'fortnight'); const now = Date.parse(instant) / 1000;
    assert.ok(block.startsAt <= now && now < block.endsAt, instant);
    assert.equal(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'long', hour: '2-digit', hourCycle: 'h23' }).format(block.startsAt * 1000), 'Monday, 00', instant);
  }
});

test('the week period is the existing Madrid week, and an unknown period or instant is rejected', () => {
  assert.deepEqual(period('2026-11-18T12:00:00Z', 'week'), week('2026-11-18T12:00:00Z'));
  for (const bad of ['day', '', 'Month', undefined, null]) assert.throws(() => madridVoicePeriod(Date.parse('2026-11-16T12:00:00Z'), bad), RangeError);
  for (const bad of [NaN, Infinity, -1, '2026-11-16']) assert.throws(() => madridVoicePeriod(bad, 'month'), RangeError);
});
