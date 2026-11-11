'use strict';
// Photo upgrade for European destination cards (86 photos replaced, 20 deliberately kept).
// Guards: only photo + source/author/licence metadata changed, the 16 home-page cards are untouched,
// the kept destinations keep their original photo, and every other destination is unchanged.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'europe-photo-upgrade.json'), 'utf8'));

const cache = {};
function load(rel) {
  const file = path.join(root, rel);
  if (cache[file]) return cache[file];
  const source = fs.readFileSync(file, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  cache[file] = module.exports;
  const dir = path.dirname(file);
  const req = id => {
    if (id.startsWith('.') || id.startsWith('@/')) {
      const base = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.join(dir, id);
      for (const ext of ['.ts', '.tsx', '/index.ts']) if (fs.existsSync(base + ext)) return load(path.relative(root, base + ext));
    }
    return require(id);
  };
  new Function('exports', 'require', 'module', output)(module.exports, req, module);
  return module.exports;
}
const profiles = load('lib/destinations/index.ts').destinationProfiles;
const byId = new Map(profiles.map(profile => [profile.id, profile]));
const homeCards = load('lib/destinations/featured.ts').destinations;
const md5 = value => crypto.createHash('md5').update(value).digest('hex');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

test('the 16 original home-page cards are identical in content, order, texts and links', () => {
  assert.equal(homeCards.length, 16);
  assert.deepEqual(homeCards.map(card => card.name), fixture.homeCards.names);
  assert.deepEqual(homeCards.map(card => card.image), fixture.homeCards.images);
  assert.equal(md5(JSON.stringify(homeCards)), fixture.homeCards.digest);
});

test('every upgraded destination uses the approved photo with its own source, author and licence', () => {
  assert.equal(fixture.updated.length, 86);
  for (const expected of fixture.updated) {
    const profile = byId.get(expected.id);
    assert.ok(profile, `missing destination ${expected.id}`);
    assert.equal(profile.image, expected.image, `${expected.id} image`);
    assert.equal(profile.imageSource, expected.source, `${expected.id} source`);
    assert.equal(profile.imageCredit, expected.credit, `${expected.id} author`);
    assert.equal(profile.imageLicense, expected.license, `${expected.id} licence`);
    assert.equal(profile.imageLicenseUrl, expected.licenseUrl, `${expected.id} licence url`);
    assert.ok(expected.width / expected.height >= 1.4, `${expected.id} must be a horizontal photo`);
    assert.ok(expected.width >= 2500, `${expected.id} must be high resolution`);
    const fileName = expected.file.replace(/ /g, '_');
    const hash = md5(fileName);
    assert.ok(profile.image.startsWith(`https://thumb.wikimedia.org/wikipedia/commons/thumb/${hash[0]}/${hash.slice(0, 2)}/`), `${expected.id} thumbnail path`);
    assert.equal(decodeURIComponent(profile.image.split('/').slice(-2)[0]), fileName);
    assert.equal(decodeURIComponent(profile.imageSource.replace('https://commons.wikimedia.org/wiki/File:', '')), fileName);
    assert.match(profile.imageLicenseUrl, /^https:\/\/creativecommons\.org\/(licenses|publicdomain)\//);
    if (/^CC BY/.test(profile.imageLicense)) assert.ok(profile.imageCredit && profile.imageCredit.length > 1, `${expected.id} needs attribution`);
  }
});

test('the destinations decided to keep their current photo are completely intact', () => {
  assert.equal(fixture.kept.length, 20);
  for (const expected of fixture.kept) {
    const profile = byId.get(expected.id);
    assert.ok(profile, `missing destination ${expected.id}`);
    assert.equal(profile.image, expected.image, `${expected.id} image`);
    assert.equal(profile.imageSource, expected.source ?? undefined, `${expected.id} source`);
    assert.equal(profile.imageCredit, expected.credit ?? undefined, `${expected.id} author`);
    assert.equal(profile.imageLicense, expected.license ?? undefined, `${expected.id} licence`);
    assert.equal(profile.imageLicenseUrl, expected.licenseUrl ?? undefined, `${expected.id} licence url`);
  }
});

test('no other destination photo or credit changed', () => {
  const touched = new Set([...fixture.updated, ...fixture.kept].map(entry => entry.id));
  const others = profiles.filter(profile => !touched.has(profile.id))
    .map(profile => [profile.id, profile.image, profile.imagePosition ?? null, profile.imageSource ?? null, profile.imageCredit ?? null, profile.imageLicense ?? null, profile.imageLicenseUrl ?? null]);
  assert.equal(others.length, fixture.others.count);
  assert.equal(sha(JSON.stringify(others)), fixture.others.digest);
});

test('the catalog keeps its size, unique ids and no destination reuses another one\'s photo by mistake', () => {
  assert.equal(profiles.length, fixture.catalogSize);
  assert.equal(new Set(profiles.map(profile => profile.id)).size, profiles.length);
  const updatedImages = fixture.updated.map(entry => entry.image);
  assert.equal(new Set(updatedImages).size, updatedImages.length);
});
