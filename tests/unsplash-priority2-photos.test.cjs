// Fotos de Unsplash elegidas por el propietario (prioridad 2): 28 fichas del catálogo y 3 tarjetas de la página de
// temporada de invierno. Cambian SOLO las fotos (y su crédito en las fichas); el resto del contenido sigue igual. Las 16
// tarjetas de la portada no se tocan. Autor, lugar y licencia se comprobaron en la página de cada foto el 12-11-2026.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const helpers = require('./helpers/ficha-snapshots.cjs');
const { LOCALES, flatten, serialize, createRenderer, loader, loadFraming } = helpers;

const root = path.resolve(__dirname, '..');
const photos = require('./fixtures/unsplash-priority2.json');
const before = require('./fixtures/unsplash-priority2-before.json');
const catalog = loader(root)('lib/destinations/index.ts');
const featured = loader(root)('lib/destinations/featured.ts');
const framing = loadFraming(root);
const PHOTO_KEYS = ['image', 'imageSource', 'imageCredit', 'imageLicense', 'imageLicenseUrl'];
const sha = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const rest = profile => Object.fromEntries(Object.entries(JSON.parse(JSON.stringify(profile))).filter(([key]) => !PHOTO_KEYS.includes(key)));
const page = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);

test('the record has 28 catalog photos and 3 season photos, each with a verified author and an Unsplash page', () => {
  assert.equal(photos.catalog.length, 28);
  assert.equal(photos.seasons.length, 3);
  assert.equal(new Set(photos.catalog.map(p => p.id)).size, 28);
  for (const photo of [...photos.catalog, ...photos.seasons]) {
    assert.match(photo.unsplashId, /^[\w-]{11}$/, photo.card);
    assert.match(photo.cdn, /^photo-[0-9a-f]+-[0-9a-f]+$/, photo.card);
    assert.ok(photo.author.trim().length > 1, photo.card);
    assert.ok(photo.placeOnUnsplash.length > 3, photo.card);
  }
});

test('every catalog destination uses its Unsplash photo with its own page, author and license', () => {
  for (const photo of photos.catalog) {
    const profile = catalog.getDestinationById(photo.id);
    assert.ok(profile, photo.id);
    assert.equal(profile.image, `https://images.unsplash.com/${photo.cdn}?auto=format&fit=crop&w=1600&q=80`, photo.id);
    assert.equal(profile.imageSource, `https://unsplash.com/photos/${photo.unsplashId}`, photo.id);
    assert.equal(profile.imageCredit, photo.author, photo.id);
    assert.equal(profile.imageLicense, 'Unsplash License', photo.id);
    assert.equal(profile.imageLicenseUrl, 'https://unsplash.com/license', photo.id);
    for (const key of PHOTO_KEYS) assert.equal(profile[key], photo[key], `${photo.id} ${key}`);
    // Ya no es la foto de Wikimedia Commons que tenía antes.
    assert.ok(before.profiles[photo.id].photo.image.includes('wikimedia.org'), photo.id);
    assert.ok(!profile.image.includes('wikimedia') && !profile.imageSource.includes('wikimedia'), photo.id);
  }
});

test('only the photo and its credit changed in each of the 28 profiles: every other field and the field order are as before', () => {
  for (const photo of photos.catalog) {
    const profile = catalog.getDestinationById(photo.id);
    const old = before.profiles[photo.id];
    assert.equal(sha(rest(profile)), old.restSha256, photo.id);
    assert.deepEqual(Object.keys(profile), old.fields, photo.id);
  }
});

test('the other catalog profiles and the 16 home cards are untouched; each new photo belongs to its destination only', () => {
  assert.equal(featured.destinations.length, 16);
  const changed = new Set(photos.catalog.map(p => p.id));
  for (const profile of catalog.destinationProfiles) {
    if (changed.has(profile.id)) continue;
    assert.ok(!photos.catalog.some(p => profile.image.includes(p.cdn)), `${profile.id} reuses one of the new photos`);
  }
  for (const photo of photos.catalog) {
    const users = catalog.destinationProfiles.filter(p => p.image.includes(photo.cdn));
    assert.deepEqual(Array.from(users, p => p.id), [photo.id]);
  }
  for (const destination of featured.destinations) assert.ok(!photos.catalog.some(p => destination.image.includes(p.cdn)), destination.name);
});

test('the detail window of the 28 destinations, in seven languages, is the same as before except photo and credit', () => {
  for (const locale of LOCALES) {
    const renderer = createRenderer(root, locale);
    for (const photo of photos.catalog) {
      const profile = renderer.profiles.find(p => p.id === photo.id);
      const old = { ...JSON.parse(JSON.stringify(profile)), ...before.profiles[photo.id].photo };
      let previous = serialize(renderer.detail(old));
      for (const key of PHOTO_KEYS) previous = previous.replaceAll(JSON.stringify(old[key]).slice(1, -1), JSON.stringify(profile[key]).slice(1, -1));
      const current = renderer.detail(profile);
      assert.equal(serialize(current), previous, `${locale} ${photo.id}`);
      const nodes = flatten(current);
      assert.ok(nodes.some(n => n.type === 'img' && n.props.src === profile.image), `${locale} ${photo.id} shows the photo`);
      const link = nodes.find(n => n.type === 'a' && n.props.href === profile.imageSource);
      assert.ok(link && text(link).includes(photo.author), `${locale} ${photo.id} credits the author`);
      assert.equal(text(nodes.find(n => n.type === 'a' && n.props.href === profile.imageLicenseUrl)), 'Unsplash License', `${locale} ${photo.id}`);
      assert.ok(!serialize(current).includes('wikimedia'), `${locale} ${photo.id}`);
    }
  }
});

test('the vertical framing is set only where the centered crop cut the subject, and nothing else about the framing changed', () => {
  const expected = Object.fromEntries(photos.catalog.filter(p => p.framing).map(p => [p.id, p.framing]));
  assert.equal(Object.keys(expected).length, 13);
  for (const photo of photos.catalog) {
    const profile = catalog.getDestinationById(photo.id);
    assert.equal(profile.imagePosition, undefined, `${photo.id} has no position of its own`);
    assert.equal(framing.panoramicImagePosition(profile), expected[photo.id], photo.id);
  }
  for (const position of Object.values(expected)) assert.match(position, /^center \d{1,3}%$/);
  assert.equal(featured.destinations.length, 16);
});

test('the three winter season cards use their Unsplash photo and the season pages differ from before only in those addresses', () => {
  const byFile = {};
  for (const photo of photos.seasons) (byFile[photo.file] ||= []).push(photo);
  assert.deepEqual(Object.keys(byFile).sort(), ['app/temporadas/invierno/page.tsx']);
  for (const [file, list] of Object.entries(byFile)) {
    let current = page(file);
    for (const photo of list) {
      assert.equal(current.split(photo.image).length - 1, 1, `${photo.card} appears once`);
      assert.match(photo.image, /^https:\/\/images\.unsplash\.com\/photo-[0-9a-f-]+\?auto=format&fit=crop&w=1200&q=80$/);
      current = current.replace(photo.image, photo.oldImage);
    }
    const season = path.basename(path.dirname(file));
    assert.equal(sha(current), before.seasonHashes[season], `${season} is identical to before once the old addresses are put back`);
  }
  // Las páginas de primavera, verano y otoño no cambian en esta PR.
  for (const season of ['primavera', 'verano', 'otono']) assert.equal(sha(page(`app/temporadas/${season}/page.tsx`)), before.seasonHashes[season], season);
  // Hokkaido (invierno) y las demás tarjetas siguen con su foto.
  assert.ok(page('app/temporadas/invierno/page.tsx').includes('Hokkaido'));
});
