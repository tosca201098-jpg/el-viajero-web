'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const sourceRoot = process.env.VOICE_LUA_SOURCE_ROOT || path.resolve(__dirname, '..');
const harness = require(path.join(sourceRoot, 'scripts/maintenance/voice-lua-local.cjs'));
const prefix = 'destinauta:test:11111111-2222-4333-8444-555555555555';
const ownKey = prefix + ':fixture';
const lua = 'return {1, 0}';
const nonce = 'a'.repeat(32);

test('the Redis harness requires an explicit isolated-database acknowledgement', () => {
  for (const args of [[], ['--port', '16379'], ['--host', '127.0.0.1'], ['--help'],
    ['--isolated-test-redis', '--isolated-test-redis'], ['--isolated-test-redis', '--url', 'redis://127.0.0.1'],
    ['--isolated-test-redis', '--port'], ['--isolated-test-redis', '--port', '16379', '--port', '16379']]) {
    assert.throws(() => harness.parseArgs(args));
  }
  assert.deepEqual(harness.parseArgs(['--isolated-test-redis']), { host: '127.0.0.1', port: 16379 });
});

test('only exact literal loopback and valid ports can be selected', () => {
  for (const host of ['localhost', 'upstash.io', 'unit-test.upstash.io', 'https://127.0.0.1', 'redis://127.0.0.1',
    '0.0.0.0', '127.0.0.2', '127.000.000.001', '[::1]', '::', '127.0.0.1.attacker.example', '', ' 127.0.0.1']) {
    assert.throws(() => harness.endpoint({ host }));
  }
  for (const port of ['0', '-1', '65536', '1.5', '016379', '', 'NaN', undefined + 'x']) {
    assert.throws(() => harness.endpoint({ port }));
  }
  assert.throws(() => harness.endpoint({ url: 'redis://127.0.0.1' }));
  assert.throws(() => harness.endpoint({ host: '127.0.0.1', password: 'private' }));
  assert.deepEqual(harness.endpoint({ host: '::1', port: '65535' }), { host: '::1', port: 65535 });
  assert.deepEqual(harness.parseArgs(['--isolated-test-redis', '--host', '127.0.0.1', '--port', '1']), { host: '127.0.0.1', port: 1 });
});

test('invalid endpoint or commands fail before attempting any socket connection', async () => {
  let connections = 0;
  const connect = () => { connections++; throw Error('must not connect'); };
  assert.throws(() => new harness.LocalRedis({ host: 'remote.upstash.io' }, prefix, lua, connect));
  const client = new harness.LocalRedis({}, prefix, lua, connect);
  for (const command of [['FLUSHALL'], ['FLUSHDB'], ['CONFIG', 'GET', '*'], ['AUTH', 'private'],
    ['GET', 'destinauta:ai:v1:preview:voice:global:day'], ['SCAN', '0'], ['KEYS', '*'],
    ['DEL', ownKey], ['SHUTDOWN'], ['ACL', 'LIST'], ['EVAL', 'return 1', 0]]) {
    await assert.rejects(client.send(command));
  }
  assert.equal(connections, 0);
});

test('every allowed key is bounded to a unique fake dataset and one reviewed script', () => {
  const allowed = [
    ['TIME'], ['GET', ownKey], ['HGETALL', ownKey], ['TTL', ownKey], ['TYPE', ownKey], ['EXISTS', ownKey],
    ['EXPIREAT', ownKey, 1800000000], ['HSET', ownKey, nonce, 'x'],
    ['SET', ownKey, 'fixture-wrong-type', 'EX', 120],
    ['EVAL', lua, 1, ownKey, 'reserve', nonce, 1800000000, 1800086400, 30],
    ['EVAL', lua, 1, ownKey, 'commit', nonce, 1800000000, 1800086400, 30],
    ['EVAL', lua, 1, ownKey, 'cancel', nonce, 1800000000, 1800086400, 30],
  ];
  for (const command of allowed) assert.equal(harness.validateOwnedCommand(command, prefix, lua), command);
  for (const key of [prefix, prefix + 'other:fixture', 'other:fixture', ownKey + '\r\nFLUSHALL', ownKey + ' ']) {
    assert.throws(() => harness.validateOwnedCommand(['GET', key], prefix, lua));
  }
  for (const command of [
    ['SET', ownKey, 'unrestricted-value', 'EX', 120], ['SET', ownKey, 'fixture-wrong-type'],
    ['SET', ownKey, 'fixture-wrong-type', 'EX', 90001], ['HSET', ownKey, 'external-identity', 'x'],
    ['EVAL', lua + '\nreturn 99', 1, ownKey, 'reserve', nonce, 1800000000, 1800086400, 30],
    ['EVAL', lua, 2, ownKey, 'reserve', nonce, 1800000000, 1800086400, 30],
    ['EVAL', lua, 1, ownKey, 'refund', nonce, 1800000000, 1800086400, 30],
    ['EVAL', lua, 1, ownKey, 'reserve', 'bad-nonce', 1800000000, 1800086400, 30],
    ['EVAL', lua, 1, ownKey, 'reserve', nonce, 1800000000, 1800086400, 61],
  ]) assert.throws(() => harness.validateOwnedCommand(command, prefix, lua));
});

test('RESP encoding uses byte lengths and cannot turn text into another Redis command', () => {
  const encoded = harness.encodeCommand(['ECHO', 'España\r\nFLUSHALL']);
  assert.equal(encoded.toString(), '*2\r\n$4\r\nECHO\r\n$17\r\nEspaña\r\nFLUSHALL\r\n');
  assert.throws(() => harness.encodeCommand(['GET', {}]));
  assert.throws(() => harness.encodeCommand(['GET', NaN]));
});

test('RESP parsing handles partial messages, arrays, nulls and bounded replies', () => {
  assert.equal(harness.parseResponse(Buffer.from('$5\r\nhel')), null);
  assert.deepEqual(harness.parseResponse(Buffer.from('*3\r\n:1\r\n$-1\r\n+OK\r\n')).value, [1, null, 'OK']);
  assert.deepEqual(harness.parseResponse(Buffer.from('$7\r\nEspaña\r\n')).value, 'España');
  for (const input of ['$-2\r\n', '*10001\r\n', ':9007199254740992\r\n', '$1\r\naXX', '#t\r\n']) {
    assert.throws(() => harness.parseResponse(Buffer.from(input)));
  }
  assert.throws(() => harness.parseResponse(Buffer.alloc(1024 * 1024 + 1)));
});

test('Redis errors are generic and Lua result codes are validated', () => {
  const result = harness.parseResponse(Buffer.from('-ERR PRIVATE_SCRIPT_OR_CREDENTIAL\r\n')).value;
  assert(result instanceof Error);
  assert.equal(result.message, 'local_redis_command_failed');
  assert.equal(result.message.includes('PRIVATE'), false);
  for (const value of [[1, 0], [2, 0], [0, 3600], [-1, 0]]) assert.equal(harness.luaCode(value), value[0]);
  for (const value of [null, [1], ['1', 0], [3, 0], [0, -1], [0, 1.5]]) assert.throws(() => harness.luaCode(value));
});

test('the bounded RESP transport works with fragments and sanitizes socket failures without real sockets', async () => {
  function fakeTransport(behavior) {
    let connections = 0;
    class Socket extends EventEmitter {
      setTimeout() { return this; }
      destroy() { this.emit('close'); }
      write(bytes) {
        assert(Buffer.isBuffer(bytes));
        queueMicrotask(() => {
          if (behavior === 'fragments') {
            this.emit('data', Buffer.from('*2\r\n:1\r\n'));
            this.emit('data', Buffer.from(':0\r\n'));
          } else if (behavior === 'error') this.emit('error', Error('PRIVATE_SOCKET_DETAIL'));
          else if (behavior === 'multiple') this.emit('data', Buffer.from(':1\r\n:2\r\n'));
          else this.emit('data', Buffer.alloc(1024 * 1024 + 1));
        });
      }
    }
    const connect = options => {
      connections++;
      assert.deepEqual(options, { host: '127.0.0.1', port: 16379 });
      const socket = new Socket();
      queueMicrotask(() => socket.emit('connect'));
      return socket;
    };
    return { client: new harness.LocalRedis({}, prefix, lua, connect), count: () => connections };
  }
  const good = fakeTransport('fragments');
  assert.deepEqual(await good.client.send(['EVAL', lua, 1, ownKey, 'reserve', nonce, 1800000000, 1800086400, 30]), [1, 0]);
  assert.equal(good.count(), 1);
  for (const behavior of ['error', 'multiple', 'oversized']) {
    const bad = fakeTransport(behavior);
    await assert.rejects(bad.client.send(['TIME']), error => !error.message.includes('PRIVATE') &&
      ['invalid_redis_reply', 'local_redis_unavailable'].includes(error.message));
  }
});

test('the local harness does not read application credentials or provide remote/administrative commands', () => {
  const source = fs.readFileSync(path.join(sourceRoot, 'scripts/maintenance/voice-lua-local.cjs'), 'utf8');
  assert.equal(/process\.env\.(AI_|ELEVENLABS|OPENAI|UPSTASH|VERCEL)/.test(source), false);
  assert.equal(/\bfetch\s*\(|require\(['"]node:https?['"]\)|child_process|execCommand|spawn\s*\(/.test(source), false);
  assert.equal(/\[['"](?:FLUSHALL|FLUSHDB|SCAN|KEYS|CONFIG|ACL|AUTH|SHUTDOWN|DEL)['"]/.test(source), false);
  assert(source.includes("'destinauta:test:' + randomUUID()"));
  assert(source.includes('await sleep(1050)'));
});
