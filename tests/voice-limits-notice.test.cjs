const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
function load(file) {
  const exports = {};
  const output = ts.transpileModule(read(file), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(output, { exports, require }, { filename: file });
  return exports;
}
const limits = load('lib/voice/limits.ts');
const { locales, translate } = load('lib/i18n/translations.ts');
const variables = {
  total: limits.VOICE_DAILY_MINUTES,
  count: limits.VOICE_DAILY_CONVERSATIONS,
  minutes: limits.VOICE_CONVERSATION_MINUTES,
};

test('el aviso dice 15 minutos al día, 3 conversaciones de 5 minutos, en los siete idiomas', () => {
  assert.deepEqual(variables, { total: 15, count: 3, minutes: 5 });
  assert.equal(locales.length, 7);
  for (const { code } of locales) {
    const message = translate(code, 'voice.limits', variables);
    assert.ok(!message.includes('{') && !message.includes('}'), `${code}: variable sin resolver`);
    for (const number of ['15', '3', '5']) assert.match(message, new RegExp(`(^|\\D)${number}(\\D|$)`), `${code}: falta ${number}`);
  }
  assert.equal(translate('es', 'voice.limits', variables),
    'Hasta 15 minutos al día por persona: 3 conversaciones de 5 minutos como máximo.');
});

test('los números del aviso coinciden con los límites que aplica el servidor', () => {
  // Conversaciones por persona y día natural de Madrid.
  const policy = read('lib/ai/voice-daily-policy.ts');
  assert.match(policy, /VOICE_DAILY_LIMIT = (\d+);/);
  assert.equal(Number(policy.match(/VOICE_DAILY_LIMIT = (\d+);/)[1]), limits.VOICE_DAILY_CONVERSATIONS);
  // Duración máxima de cada conversación en Production: el agente verificado debe durar 300 s.
  for (const file of ['lib/voice/provider-config.ts', 'lib/voice/elevenlabs-route.ts']) {
    const match = read(file).match(/max_duration_seconds === \(preview \? \d+ : (\d+)\)/);
    assert.ok(match, `${file}: no se encontró la comprobación de duración`);
    assert.equal(Number(match[1]), limits.VOICE_CONVERSATION_MINUTES * 60, file);
  }
});

test('la portada muestra el aviso dentro del panel de Sofía con las constantes compartidas', () => {
  const page = read('app/page.tsx');
  assert.match(page, /from "@\/lib\/voice\/limits"/);
  assert.match(page, /t\("voice\.limits", \{ total: VOICE_DAILY_MINUTES, count: VOICE_DAILY_CONVERSATIONS, minutes: VOICE_CONVERSATION_MINUTES \}\)/);
  assert.ok(page.indexOf('voice.limits') > page.indexOf('voice.recommendations'));
});
