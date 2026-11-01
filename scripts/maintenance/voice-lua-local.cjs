'use strict';

// Acceptance harness for a dedicated, disposable LOOPBACK Redis process supplied by CI.
// It never starts Redis, discovers servers, reads service credentials, or contacts Upstash.
const net = require('node:net');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { randomUUID, randomBytes } = require('node:crypto');

const MAX_REPLY = 1024 * 1024;
const FIXTURE_PREFIX = /^destinauta:test:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function endpoint(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options) ||
      Object.keys(options).some(key => !['host', 'port'].includes(key))) throw Error('invalid_local_endpoint');
  const host = options.host === undefined ? '127.0.0.1' : options.host;
  const portText = options.port === undefined ? '16379' : String(options.port);
  if (!['127.0.0.1', '::1'].includes(host) || !/^[1-9]\d{0,4}$/.test(portText)) throw Error('invalid_local_endpoint');
  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('invalid_local_endpoint');
  return { host, port };
}

function parseArgs(argv) {
  if (!Array.isArray(argv) || argv.some(value => typeof value !== 'string')) throw Error('invalid_local_arguments');
  let isolated = false;
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const argument = argv[i];
    if (argument === '--isolated-test-redis') {
      if (isolated) throw Error('invalid_local_arguments');
      isolated = true;
    } else if (argument === '--host' || argument === '--port') {
      const name = argument.slice(2);
      if (name in options || !argv[i + 1] || argv[i + 1].startsWith('--')) throw Error('invalid_local_arguments');
      options[name] = argv[++i];
    } else throw Error('invalid_local_arguments');
  }
  if (!isolated) throw Error('isolated_test_redis_confirmation_required');
  return endpoint(options);
}

function encodeCommand(command) {
  if (!Array.isArray(command) || command.length < 1 || command.length > 100 ||
      command.some(value => !['string', 'number'].includes(typeof value) ||
        (typeof value === 'number' && !Number.isSafeInteger(value)))) throw Error('invalid_redis_command');
  const chunks = [Buffer.from('*' + command.length + '\r\n')];
  for (const value of command) {
    const bytes = Buffer.from(String(value), 'utf8');
    if (bytes.length > MAX_REPLY) throw Error('invalid_redis_command');
    chunks.push(Buffer.from('$' + bytes.length + '\r\n'), bytes, Buffer.from('\r\n'));
  }
  return Buffer.concat(chunks);
}

function parseResponse(buffer, offset = 0, depth = 0) {
  if (!Buffer.isBuffer(buffer) || buffer.length > MAX_REPLY || depth > 16) throw Error('invalid_redis_reply');
  if (offset >= buffer.length) return null;
  const type = String.fromCharCode(buffer[offset]);
  const lineEnd = buffer.indexOf('\r\n', offset + 1);
  if (lineEnd < 0) return null;
  const line = buffer.toString('utf8', offset + 1, lineEnd);
  const next = lineEnd + 2;
  if (type === '+') return { value: line, offset: next };
  // Never return or log an upstream error message (it may include script or configuration data).
  if (type === '-') return { value: new Error('local_redis_command_failed'), offset: next };
  if (![':', '$', '*'].includes(type) || !/^-?(0|[1-9]\d*)$/.test(line)) throw Error('invalid_redis_reply');
  const number = Number(line);
  if (!Number.isSafeInteger(number)) throw Error('invalid_redis_reply');
  if (type === ':') return { value: number, offset: next };
  if (number === -1) return { value: null, offset: next };
  if (number < 0 || number > MAX_REPLY) throw Error('invalid_redis_reply');
  if (type === '$') {
    if (next + number + 2 > buffer.length) return null;
    if (buffer.toString('ascii', next + number, next + number + 2) !== '\r\n') throw Error('invalid_redis_reply');
    return { value: buffer.toString('utf8', next, next + number), offset: next + number + 2 };
  }
  if (number > 10000) throw Error('invalid_redis_reply');
  const values = [];
  let cursor = next;
  for (let i = 0; i < number; i++) {
    const item = parseResponse(buffer, cursor, depth + 1);
    if (!item) return null;
    if (item.value instanceof Error) throw Error('local_redis_command_failed');
    values.push(item.value);
    cursor = item.offset;
  }
  return { value: values, offset: cursor };
}

function positiveInteger(value) {
  return (typeof value === 'string' && /^[1-9]\d{0,12}$/.test(value)) ||
    (typeof value === 'number' && Number.isSafeInteger(value) && value > 0);
}

function validateOwnedCommand(command, prefix, lua) {
  if (!FIXTURE_PREFIX.test(prefix) || typeof lua !== 'string' || !lua || lua.length > 65536 || !Array.isArray(command)) {
    throw Error('unsafe_local_command');
  }
  const owns = value => typeof value === 'string' && value.startsWith(prefix + ':') &&
    value.length <= 256 && /^[a-z0-9:-]+$/.test(value);
  const operation = command[0];
  if (operation === 'TIME' && command.length === 1) return command;
  if (['GET', 'HGETALL', 'TTL', 'TYPE', 'EXISTS'].includes(operation) && command.length === 2 && owns(command[1])) return command;
  if (operation === 'EXPIREAT' && command.length === 3 && owns(command[1]) && positiveInteger(command[2])) return command;
  // SET exists solely to create a WRONGTYPE fixture; no unrestricted SET/options are supported.
  if (operation === 'SET' && command.length === 5 && owns(command[1]) &&
      command[2] === 'fixture-wrong-type' && command[3] === 'EX' &&
      positiveInteger(command[4]) && Number(command[4]) <= 90000) return command;
  if (operation === 'HSET' && command.length >= 4 && command.length <= 44 && command.length % 2 === 0 && owns(command[1])) {
    for (let i = 2; i < command.length; i += 2) {
      if (!/^[a-f0-9]{32}$/.test(command[i]) || typeof command[i + 1] !== 'string' ||
          !/^[a-z0-9:-]{1,64}$/.test(command[i + 1])) throw Error('unsafe_local_command');
    }
    return command;
  }
  if (operation === 'EVAL' && command.length === 9 && command[1] === lua && command[2] === 1 && owns(command[3]) &&
      ['reserve', 'commit', 'cancel'].includes(command[4]) && /^[a-f0-9]{32}$/.test(command[5]) &&
      positiveInteger(command[6]) && positiveInteger(command[7]) && positiveInteger(command[8]) &&
      Number(command[8]) <= 60) return command;
  throw Error('unsafe_local_command');
}

class LocalRedis {
  constructor(options, prefix, lua, connect = net.createConnection) {
    this.endpoint = endpoint(options);
    if (!FIXTURE_PREFIX.test(prefix) || typeof lua !== 'string' || !lua || lua.length > 65536 || typeof connect !== 'function') {
      throw Error('unsafe_local_command');
    }
    this.prefix = prefix;
    this.lua = lua;
    this.connect = connect;
  }
  async send(command) {
    validateOwnedCommand(command, this.prefix, this.lua);
    const encoded = encodeCommand(command);
    return new Promise((resolve, reject) => {
      let socket, finished = false, buffered = Buffer.alloc(0);
      const finish = (error, value) => {
        if (finished) return;
        finished = true;
        socket?.setTimeout(0);
        socket?.destroy();
        if (error) reject(new Error(error)); else resolve(value);
      };
      try {
        // Literal loopback only: no DNS, TLS, credentials, environment variables or URL handling.
        socket = this.connect({ host: this.endpoint.host, port: this.endpoint.port });
        socket.setTimeout(2500);
        socket.once('timeout', () => finish('local_redis_timeout'));
        socket.once('error', () => finish('local_redis_unavailable'));
        socket.once('end', () => { if (!finished) finish('invalid_redis_reply'); });
        socket.once('close', () => { if (!finished) finish('local_redis_unavailable'); });
        socket.once('connect', () => socket.write(encoded));
        socket.on('data', bytes => {
          try {
            if (finished) return;
            if (buffered.length + bytes.length > MAX_REPLY) return finish('invalid_redis_reply');
            buffered = Buffer.concat([buffered, bytes]);
            const reply = parseResponse(buffered);
            if (!reply) return;
            if (reply.offset !== buffered.length) return finish('invalid_redis_reply');
            if (reply.value instanceof Error) return finish('local_redis_command_failed');
            finish(null, reply.value);
          } catch { finish('invalid_redis_reply'); }
        });
      } catch { finish('local_redis_unavailable'); }
    });
  }
}

function loadPolicy() {
  const repository = process.env.VOICE_LUA_REPO_ROOT || path.resolve(__dirname, '../..');
  const sources = process.env.VOICE_LUA_SOURCE_ROOT || repository;
  const ts = require(path.join(repository, 'node_modules/typescript'));
  const file = path.join(sources, 'lib/ai/voice-daily-policy.ts');
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, Date, Intl, Math, Number, String, RegExp, JSON,
    require: name => { if (name.startsWith('node:')) return require(name); throw Error('unexpected_policy_dependency'); } });
  if (typeof exports.VOICE_DAY_LEDGER_LUA !== 'string' || typeof exports.madridVoiceDay !== 'function') throw Error('invalid_local_policy');
  return exports;
}

function luaCode(value) {
  if (!Array.isArray(value) || value.length !== 2 || ![-1, 0, 1, 2].includes(value[0]) ||
      !Number.isSafeInteger(value[1]) || value[1] < 0) throw Error('invalid_lua_result');
  return value[0];
}
const nonce = () => randomBytes(16).toString('hex');
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
function hashFields(value) {
  assert(Array.isArray(value) && value.length % 2 === 0);
  return Object.fromEntries(Array.from({ length: value.length / 2 }, (_, i) => [value[i * 2], value[i * 2 + 1]]));
}

async function runLocalLuaSuite(options, policy = loadPolicy(), report = () => {}) {
  const prefix = 'destinauta:test:' + randomUUID();
  const redis = new LocalRedis(options, prefix, policy.VOICE_DAY_LEDGER_LUA);
  const time = await redis.send(['TIME']);
  assert(Array.isArray(time) && time.length === 2 && /^\d+$/.test(time[0]));
  const now = Number(time[0]);
  const day = policy.madridVoiceDay(now * 1000);
  assert(Number.isSafeInteger(day.startsAt) && Number.isSafeInteger(day.endsAt));
  assert(day.startsAt <= now && now < day.endsAt);
  // Avoid ambiguous assertions during the final seconds of a real calendar day; rerun CI instead of waiting.
  if (day.endsAt - now < 10) throw Error('local_test_near_day_boundary');
  const key = label => prefix + ':' + label;
  const operation = async (ledger, op, id, hold = 30, window = day) => luaCode(await redis.send([
    'EVAL', policy.VOICE_DAY_LEDGER_LUA, 1, ledger, op, id, window.startsAt, window.endsAt, hold,
  ]));
  const results = [];
  const check = async (name, fn) => {
    try { await fn(); results.push({ name, passed: true }); report(name, true); }
    catch { results.push({ name, passed: false }); report(name, false); }
  };

  await check('concurrent_reservations_and_three_commits', async () => {
    const ledger = key('concurrent'), ids = Array.from({ length: 4 }, nonce);
    // Independent sockets model simultaneous workers; actual Redis serializes the Lua operations.
    const codes = await Promise.all(ids.map(id => operation(ledger, 'reserve', id)));
    assert.equal(codes.filter(code => code === 1).length, 3);
    assert.equal(codes.filter(code => code === 0).length, 1);
    const accepted = ids.filter((id, i) => codes[i] === 1);
    assert.equal(Object.keys(hashFields(await redis.send(['HGETALL', ledger]))).length, 3);
    for (const id of accepted) {
      assert.equal(await operation(ledger, 'reserve', id), 1);
      assert.equal(await operation(ledger, 'commit', id), 1);
      assert.equal(await operation(ledger, 'commit', id), 2);
      assert.equal(await operation(ledger, 'cancel', id), 2);
    }
    assert.equal(await operation(ledger, 'reserve', nonce()), 0);
    assert.equal(await redis.send(['TYPE', ledger]), 'hash');
    const ttl = await redis.send(['TTL', ledger]);
    assert(ttl > 0 && ttl <= day.endsAt - now);
  });

  await check('cancel_is_idempotent_and_never_reopens_its_nonce', async () => {
    const ledger = key('cancel'), id = nonce();
    assert.equal(await operation(ledger, 'reserve', id), 1);
    assert.equal(await operation(ledger, 'cancel', id), 1);
    assert.equal(await operation(ledger, 'cancel', id), 0);
    assert.equal(await operation(ledger, 'commit', id), 0);
    assert.equal(await operation(ledger, 'reserve', id), 0);
    assert.equal(await operation(ledger, 'reserve', nonce()), 1);
  });

  await check('expired_holds_do_not_consume_slots_or_reopen_tokens', async () => {
    const ledger = key('expired'), ids = Array.from({ length: 3 }, nonce);
    for (const id of ids) assert.equal(await operation(ledger, 'reserve', id, 1), 1);
    await sleep(1050);
    for (const id of ids) {
      assert.equal(await operation(ledger, 'commit', id, 1), 0);
      assert.equal(await operation(ledger, 'reserve', id, 1), 0);
    }
    assert.equal(await operation(ledger, 'reserve', nonce(), 1), 1);
  });

  await check('racing_commit_and_cancel_have_one_terminal_outcome', async () => {
    const ledger = key('race'), id = nonce();
    assert.equal(await operation(ledger, 'reserve', id), 1);
    const outcomes = await Promise.all([operation(ledger, 'commit', id), operation(ledger, 'cancel', id)]);
    const state = hashFields(await redis.send(['HGETALL', ledger]))[id];
    assert(['c', 'x'].includes(state));
    if (state === 'c') {
      assert.deepEqual(outcomes, [1, 2]);
      assert.equal(await operation(ledger, 'cancel', id), 2);
    } else {
      assert.deepEqual(outcomes, [0, 1]);
      assert.equal(await operation(ledger, 'commit', id), 0);
    }
  });

  await check('outside_calendar_windows_do_not_create_keys', async () => {
    for (const window of [policy.madridVoiceDay((day.startsAt - 1) * 1000), policy.madridVoiceDay((day.endsAt + 1) * 1000)]) {
      const ledger = key('outside-' + nonce());
      assert.equal(await operation(ledger, 'reserve', nonce(), 30, window), 0);
      assert.equal(await redis.send(['EXISTS', ledger]), 0);
      assert.equal(await redis.send(['TTL', ledger]), -2);
    }
  });

  await check('corrupt_fields_are_rejected_without_writes_or_ttl_extension', async () => {
    const ledger = key('corrupt');
    await redis.send(['HSET', ledger, nonce(), 'not-a-state']);
    await redis.send(['EXPIREAT', ledger, day.endsAt]);
    const before = await redis.send(['HGETALL', ledger]), ttl = await redis.send(['TTL', ledger]);
    assert.equal(await operation(ledger, 'reserve', nonce()), -1);
    assert.deepEqual(await redis.send(['HGETALL', ledger]), before);
    const afterTtl = await redis.send(['TTL', ledger]);
    assert(afterTtl <= ttl && afterTtl >= ttl - 2);
  });

  await check('wrong_key_type_is_rejected_without_overwrite_or_ttl_extension', async () => {
    const ledger = key('wrongtype');
    await redis.send(['SET', ledger, 'fixture-wrong-type', 'EX', 120]);
    const before = await redis.send(['GET', ledger]), ttl = await redis.send(['TTL', ledger]);
    assert.equal(await operation(ledger, 'reserve', nonce()), -1);
    assert.equal(await redis.send(['TYPE', ledger]), 'string');
    assert.equal(await redis.send(['GET', ledger]), before);
    const afterTtl = await redis.send(['TTL', ledger]);
    assert(afterTtl <= ttl && afterTtl >= ttl - 2);
  });

  await check('oversized_ledger_is_rejected_before_mutation', async () => {
    const ledger = key('oversized');
    await redis.send(['HSET', ledger, ...Array.from({ length: 21 }, () => [nonce(), 'x']).flat()]);
    await redis.send(['EXPIREAT', ledger, day.endsAt]);
    const before = await redis.send(['HGETALL', ledger]);
    assert.equal(await operation(ledger, 'reserve', nonce()), -1);
    assert.deepEqual(await redis.send(['HGETALL', ledger]), before);
  });

  return { passed: results.every(result => result.passed), results };
}

async function main(argv) {
  const options = parseArgs(argv); // Validate explicit consent and loopback before loading code or opening a socket.
  const summary = await runLocalLuaSuite(options, loadPolicy(), (name, passed) => console.log((passed ? 'PASS ' : 'FAIL ') + name));
  if (!summary.passed) throw Error('local_lua_assertions_failed');
  console.log('PASS local_redis_lua_acceptance');
  return summary;
}

module.exports = { endpoint, parseArgs, encodeCommand, parseResponse, validateOwnedCommand, LocalRedis, loadPolicy, luaCode, runLocalLuaSuite, main };
if (require.main === module) main(process.argv.slice(2)).catch(() => {
  console.error('FAIL local_redis_lua_acceptance');
  process.exitCode = 1;
});
