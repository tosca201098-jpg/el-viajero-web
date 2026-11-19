const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const guide = fs.readFileSync(path.join(root, 'CLAUDE.md'), 'utf8');

test('CLAUDE.md keeps the owner\'s rules in front of every session', () => {
  assert.match(guide, /16 tarjetas originales de la portada/);
  assert.match(guide, /\*\*7 idiomas\*\*: es, en, fr, de, it, pt, ca/);
  assert.match(guide, /\*\*Nunca fusiones ni publiques en producción sin autorización expresa\*\*/);
  assert.match(guide, /\*\*No inventes\*\* precios/);
  assert.match(guide, /rama independiente/);
});

test('CLAUDE.md points only to files and commands that exist', () => {
  for (const file of guide.match(/`((?:app|lib|docs|tests|\.github)\/[A-Za-z0-9_./-]+?)`/g).map(item => item.slice(1, -1))) {
    if (/[*<>]/.test(file)) continue; // patterns such as docs/sofia-*.md or tests/<file>.test.cjs
    const target = file.replace(/\/$/, '');
    assert.ok(fs.existsSync(path.join(root, target)), `${file} is mentioned in CLAUDE.md but does not exist`);
  }
  const scripts = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts;
  for (const script of ['lint', 'build']) assert.ok(scripts[script], `npm run ${script}`);
});

test('CLAUDE.md never contains a secret, only names of variables', () => {
  assert.equal(/sk-[A-Za-z0-9_-]{16,}|sk_[A-Za-z0-9_-]{16,}|eyJ[A-Za-z0-9_-]{20,}|re_[A-Za-z0-9]{16,}|xi-api-key|Bearer\s+[A-Za-z0-9._-]{16,}/.test(guide), false);
  assert.equal(/[0-9a-f]{32,}/i.test(guide), false, 'no long hexadecimal key');
  assert.equal(/agtvrsn_[a-z0-9]+|agent_[a-z0-9]{12,}/.test(guide), false, 'the pinned agent version lives in the notes, never here');
  assert.match(guide, /`ELEVENLABS_AGENT_VERSION_ID`/);
});
