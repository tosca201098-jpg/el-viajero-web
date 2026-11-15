// Fotos elegidas por el propietario para Ibiza (PR #8) y Milán (PR #13), reconstruidas sobre la versión actual de main.
// Cambian SOLO la foto, su crédito y el encuadre vertical de esas dos fichas del catálogo; el resto del contenido sigue
// igual. Las 16 tarjetas de la portada no se tocan. Asturias (PR #14) conserva su foto actual.
// Ibiza: foto de RoxFuchs en Wikimedia Commons (CC BY-SA 4.0), guardada en /public/images porque la PR #8 así lo propuso.
// Milán: foto de Fernando Meloni en Unsplash; autor, lugar y licencia se comprobaron en su página el 15-11-2026.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const helpers = require('./helpers/ficha-snapshots.cjs');
const { LOCALES, flatten, serialize, createRenderer, loader, loadFraming } = helpers;

const root = path.resolve(__dirname, '..');
const record = require('./fixtures/ibiza-milan-photos.json');
const before = require('./fixtures/ibiza-milan-photos-before.json');
const catalog = loader(root)('lib/destinations/index.ts');
const featured = loader(root)('lib/destinations/featured.ts');
const framing = loadFraming(root);
const PHOTO_KEYS = ['image', 'imageSource', 'imageCredit', 'imageLicense', 'imageLicenseUrl'];
const IDS = ['es-ibiza', 'it-milan'];
const sha = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const rest = profile => Object.fromEntries(Object.entries(JSON.parse(JSON.stringify(profile))).filter(([key]) => !PHOTO_KEYS.includes(key)));
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);
const photo = id => record.photos.find(p => p.id === id);

function jpegSize(file) {
  const data = fs.readFileSync(file);
  assert.equal(data[0], 0xff); assert.equal(data[1], 0xd8, 'it is a JPEG');
  let offset = 2;
  while (offset < data.length) {
    assert.equal(data[offset], 0xff);
    const marker = data[offset + 1];
    const length = data.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7), bytes: data.length };
    }
    offset += 2 + length;
  }
  throw new Error('no size found');
}

test('the record covers exactly Ibiza and Milan, with author, source page and license for each', () => {
  assert.deepEqual(record.photos.map(p => p.id), IDS);
  assert.deepEqual(Object.keys(before.profiles), IDS);
  for (const p of record.photos) {
    for (const key of PHOTO_KEYS) assert.ok(p[key] && p[key].trim().length > 3, `${p.id} ${key}`);
    assert.ok(!/<[^>]+>/.test(p.imageCredit), p.id);
    assert.match(p.framing, /^center \d{1,3}%$/, p.id);
  }
});

test('Ibiza uses the RoxFuchs photo stored in /public/images, credited with its Commons page and CC BY-SA 4.0', () => {
  const profile = catalog.getDestinationById('es-ibiza');
  const expected = photo('es-ibiza');
  for (const key of PHOTO_KEYS) assert.equal(profile[key], expected[key], key);
  assert.equal(profile.image, '/images/ibiza-dalt-vila-roxfuchs.jpg');
  assert.equal(profile.imageSource, 'https://commons.wikimedia.org/wiki/File:Dalt_Vila_20160421_111948.jpg');
  assert.equal(profile.imageCredit, 'RoxFuchs');
  assert.equal(profile.imageLicense, 'CC BY-SA 4.0');
  assert.equal(profile.imageLicenseUrl, 'https://creativecommons.org/licenses/by-sa/4.0');
  const file = path.join(root, 'public', profile.image);
  assert.ok(fs.existsSync(file), 'the photo file is in the repository');
  const size = jpegSize(file);
  assert.equal(size.width, expected.width); assert.equal(size.height, expected.height); assert.equal(size.bytes, expected.bytes);
  assert.ok(size.bytes < 400 * 1024, 'the photo stays light');
  assert.ok(!profile.image.includes('wikimedia') && before.profiles['es-ibiza'].photo.image.includes('wikimedia.org'));
});

test('Milan uses the Fernando Meloni photo from Unsplash with its own page, author and Unsplash License', () => {
  const profile = catalog.getDestinationById('it-milan');
  const expected = photo('it-milan');
  for (const key of PHOTO_KEYS) assert.equal(profile[key], expected[key], key);
  assert.equal(profile.image, `https://images.unsplash.com/${expected.cdn}?auto=format&fit=crop&w=1600&q=80`);
  assert.match(profile.image, /^https:\/\/images\.unsplash\.com\/photo-[0-9a-f]+-[0-9a-f]+\?auto=format&fit=crop&w=1600&q=80$/);
  assert.equal(profile.imageSource, `https://unsplash.com/photos/${expected.unsplashId}`);
  assert.match(expected.unsplashId, /^[\w-]{11}$/);
  assert.equal(profile.imageCredit, 'Fernando Meloni');
  assert.equal(profile.imageLicense, 'Unsplash License');
  assert.equal(profile.imageLicenseUrl, 'https://unsplash.com/license');
  assert.ok(before.profiles['it-milan'].photo.image.includes('wikimedia.org'));
  assert.ok(!profile.image.includes('wikimedia') && !profile.imageSource.includes('wikimedia'));
});

test('only the photo and its credit changed in each profile: every other field and the field order are as before', () => {
  for (const id of IDS) {
    const profile = catalog.getDestinationById(id);
    assert.equal(sha(rest(profile)), before.profiles[id].restSha256, id);
    assert.deepEqual(Object.keys(profile), before.profiles[id].fields, id);
    assert.equal(profile.imagePosition, undefined, `${id} has no position of its own in the data`);
  }
});

test('the other catalog profiles and the 16 home cards are untouched; each new photo belongs to its destination only', () => {
  assert.equal(featured.destinations.length, 16);
  assert.equal(featured.destinations[0].name, 'París');
  const identifiers = { 'es-ibiza': 'ibiza-dalt-vila-roxfuchs', 'it-milan': photo('it-milan').cdn };
  for (const [id, marker] of Object.entries(identifiers)) {
    const users = catalog.destinationProfiles.filter(p => p.image.includes(marker));
    assert.deepEqual(Array.from(users, p => p.id), [id]);
    for (const destination of featured.destinations) assert.ok(!destination.image.includes(marker), `${destination.name} does not use the ${id} photo`);
  }
  // Asturias (PR #14) conserva su foto actual de Wikimedia Commons.
  const asturias = catalog.getDestinationById('es-asturias');
  assert.match(asturias.image, /^https:\/\/thumb\.wikimedia\.org\//);
  assert.equal(asturias.imageCredit, 'JavierOlivares');
});

test('the detail window of Ibiza and Milan, in seven languages, is the same as before except photo and credit', () => {
  for (const locale of LOCALES) {
    const renderer = createRenderer(root, locale);
    for (const id of IDS) {
      const profile = renderer.profiles.find(p => p.id === id);
      const old = { ...JSON.parse(JSON.stringify(profile)), ...before.profiles[id].photo };
      let previous = serialize(renderer.detail(old));
      for (const key of PHOTO_KEYS) previous = previous.replaceAll(JSON.stringify(old[key]).slice(1, -1), JSON.stringify(profile[key]).slice(1, -1));
      const current = renderer.detail(profile);
      assert.equal(serialize(current), previous, `${locale} ${id}`);
      const nodes = flatten(current);
      assert.ok(nodes.some(n => n.type === 'img' && n.props.src === profile.image), `${locale} ${id} shows the photo`);
      const link = nodes.find(n => n.type === 'a' && n.props.href === profile.imageSource);
      assert.ok(link && text(link).includes(profile.imageCredit), `${locale} ${id} credits the author`);
      assert.equal(text(nodes.find(n => n.type === 'a' && n.props.href === profile.imageLicenseUrl)), profile.imageLicense, `${locale} ${id}`);
      assert.ok(!serialize(current).includes('wikimedia.org/wikipedia'), `${locale} ${id} no longer shows the old Commons photo`);
    }
  }
});

test('the vertical framing of the two new photos is set by id, in the detail window only', () => {
  for (const p of record.photos) {
    const profile = catalog.getDestinationById(p.id);
    assert.equal(framing.imageFraming[p.id], p.framing, p.id);
    assert.equal(framing.panoramicImagePosition(profile), p.framing, p.id);
    for (const locale of LOCALES) {
      const renderer = createRenderer(root, locale);
      const frame = flatten(renderer.detail(renderer.profiles.find(x => x.id === p.id))).find(n => n.props['data-destination-photo-frame']);
      const image = flatten(frame).find(n => n.type === 'img');
      assert.equal(image.props.style.objectPosition, p.framing, `${locale} ${p.id}`);
    }
  }
  // Las tarjetas de la portada no usan encuadre.
  const home = JSON.stringify(createRenderer(root, 'es').home(), (k, v) => typeof v === 'function' ? '[fn]' : v);
  assert.ok(!/objectPosition/.test(home));
});
