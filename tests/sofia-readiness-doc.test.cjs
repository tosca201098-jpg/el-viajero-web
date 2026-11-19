const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const doc = fs.readFileSync(path.join(root, 'docs/sofia-production-readiness.md'), 'utf8');
const current = doc.slice(doc.indexOf('## Estado vigente'), doc.indexOf('# Histórico'));
const walk = dir => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(dir, entry.name)) : /\.(ts|tsx)$/.test(entry.name) ? [path.join(dir, entry.name)] : []);
const code = [...walk('app'), ...walk('lib')].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
const names = text => [...text.matchAll(/`([A-Z][A-Z0-9_]{5,})`/g)].map(match => match[1]);

test('the current section of the Sofía readiness doc is split from the history and says OpenAI is gone', () => {
  assert.ok(current.length > 1500, 'the current section exists');
  assert.match(doc, /^# Histórico \(31-10-2026\): no seguir estos pasos$/m);
  assert.match(current, /funciona \*\*solo con ElevenLabs\*\*/);
  assert.match(current, /\*\*No existe reversión a OpenAI\.\*\*/);
  assert.equal(/conservar la actual|Conservar OpenAI/i.test(current), false);
});

test('every Production variable listed as current is read by the code, and every one listed as deleted is not', () => {
  const kept = current.slice(current.indexOf('Comprobadas el 19-11-2026'), current.indexOf('Borradas el 19-11-2026'));
  const deleted = current.slice(current.indexOf('Borradas el 19-11-2026'), current.indexOf('### Versión nueva del agente'));
  const keptNames = names(kept), deletedNames = names(deleted);
  assert.ok(keptNames.length >= 20 && deletedNames.length === 7, `${keptNames.length} kept, ${deletedNames.length} deleted`);
  for (const name of keptNames) assert.ok(code.includes(name), `${name} is listed as current but no code reads it`);
  for (const name of deletedNames) assert.equal(code.includes(name), false, `${name} is listed as deleted but the code still reads it`);
});

test('the pinned agent version in the doc is the one in the code', () => {
  const pinned = fs.readFileSync(path.join(root, 'lib/voice/preview-target.ts'), 'utf8').match(/SOFIA_PRODUCTION_VERSION_ID = '(agtvrsn_[a-z0-9]+)'/)[1];
  assert.ok(current.includes('`' + pinned + '`'), 'update the doc together with the constant');
  const previous = fs.readFileSync(path.join(root, 'lib/voice/preview-target.ts'), 'utf8').match(/SOFIA_PREVIOUS_PRODUCTION_VERSION_ID = '(agtvrsn_[a-z0-9]+)'/)[1];
  assert.equal(current.includes(previous), false, 'the previous version is not presented as current');
});

test('the doc names no secret value', () => {
  assert.equal(/sk-[A-Za-z0-9_-]{16,}|sk_[A-Za-z0-9_-]{16,}|eyJ[A-Za-z0-9_-]{20,}|xi-api-key|Bearer\s+[A-Za-z0-9._-]{16,}/.test(doc), false);
});
