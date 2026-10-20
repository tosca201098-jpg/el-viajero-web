const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const translations = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/i18n/translations.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: translations });

const source = fs.readFileSync(path.join(__dirname, '../app/api/voice/route.ts'), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function route(fetcher, key = 'server-only-test-key') {
  const exports = {};
  vm.runInNewContext(output, {
    exports, Response, AbortController, setTimeout, clearTimeout,
    require: id => { assert.equal(id, '@/lib/i18n/translations'); return translations; },
    process: { env: { OPENAI_API_KEY: key } }, fetch: fetcher,
  }, { filename: 'app/api/voice/route.ts' });
  return (request = new Request('https://example.test/api/voice', { method: 'POST' })) => exports.POST(request);
}

test('server forwards only the temporary secret, never provider metadata', async () => {
  const requests = [];
  const post = route(async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => ({ value: 'ephemeral-test-secret',
      session: { instructions: 'private conversation' }, providerTrace: 'private-trace' }) };
  });
  const response = await post();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { value: 'ephemeral-test-secret' });
  assert.equal(requests[0].url, 'https://api.openai.com/v1/realtime/client_secrets');
  assert.equal(requests[0].options.headers.Authorization, 'Bearer server-only-test-key');
  const payload = JSON.parse(requests[0].options.body);
  assert.equal(payload.session.model, 'gpt-realtime-2.1');
  assert.equal(payload.session.audio.output.voice, 'marin');
  assert.equal(payload.session.tools[0].name, 'buscar_viaje');
});

test('server rejects provider errors and malformed successful responses with safe messages', async () => {
  for (const providerResponse of [
    { ok: false, json: async () => ({ error: 'private-provider-detail' }) },
    { ok: true, json: async () => ({ error: 'private-provider-detail' }) },
  ]) {
    const response = await route(async () => providerResponse)();
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: 'No se pudo iniciar la voz' });
  }
});

test('server does not call provider without a configured API key', async () => {
  let called = false;
  const response = await route(async () => { called = true; }, '')();
  assert.equal(response.status, 500);
  assert.equal(called, false);
  const body = await response.json();
  assert.equal('value' in body, false);
});
