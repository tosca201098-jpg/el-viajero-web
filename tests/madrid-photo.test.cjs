// La foto de la ficha de Madrid pasa a ser la de Florian Wehde (Unsplash): vista aérea del edificio Metrópolis y la
// Gran Vía. Cambian SOLO la foto y su crédito; el resto de Madrid y de las demás fichas sigue igual.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const helpers = require('./helpers/ficha-snapshots.cjs');
const { LOCALES, flatten, serialize, createRenderer, loader } = helpers;

const root = path.resolve(__dirname, '..');
const before = require('./fixtures/madrid-before-photo.json');
const catalog = loader(root)('lib/destinations/index.ts');
const madrid = catalog.getDestinationById('es-madrid');
const PHOTO_KEYS = ['image', 'imageSource', 'imageCredit', 'imageLicense', 'imageLicenseUrl'];
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);

test('Madrid uses the Unsplash photo by Florian Wehde, with its source, author and license', () => {
  assert.equal(madrid.image, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1600&q=80');
  assert.equal(madrid.imageSource, 'https://unsplash.com/photos/metropolis-building-and-gran-via-madrid-WBGjg0DsO_g');
  assert.equal(madrid.imageCredit, 'Florian Wehde');
  assert.equal(madrid.imageLicense, 'Unsplash License');
  assert.equal(madrid.imageLicenseUrl, 'https://unsplash.com/license');
  // Y es distinta de la anterior (Wikimedia Commons, Zarateman, CC0).
  assert.ok(before.image.includes('wikimedia') && before.imageCredit === 'Zarateman');
  assert.notEqual(madrid.image, before.image);
});

test('only the photo and its credit changed in the Madrid profile: every other field is identical to before', () => {
  const rest = value => Object.fromEntries(Object.entries(JSON.parse(JSON.stringify(value))).filter(([key]) => !PHOTO_KEYS.includes(key)));
  assert.deepEqual(rest(madrid), rest(before));
  assert.deepEqual(Object.keys(madrid), Object.keys(before), 'same fields, same order');
  for (const key of ['id', 'slug', 'countryCode', 'name', 'country', 'description', 'recommendedStay']) assert.equal(madrid[key], before[key], key);
  assert.deepEqual(Array.from(madrid.airports, a => ({ ...a })), before.airports);
  assert.deepEqual(Array.from(madrid.iataCodes), before.iataCodes);
  assert.deepEqual(Array.from(madrid.recommendations), before.recommendations);
});

test('the Madrid window, in seven languages, is the same as before except the photo and its credit', () => {
  const swaps = PHOTO_KEYS.map(key => [before[key], madrid[key]]);
  for (const locale of LOCALES) {
    const renderer = createRenderer(root, locale);
    const current = renderer.detail(renderer.profiles.find(p => p.id === 'es-madrid'));
    const previous = renderer.detail(before);
    let old = serialize(previous);
    for (const [from, to] of swaps) old = old.replaceAll(JSON.stringify(from).slice(1, -1), JSON.stringify(to).slice(1, -1));
    assert.equal(serialize(current), old, locale);
    // La foto y el crédito se ven en la ficha.
    const nodes = flatten(current);
    assert.equal(nodes.find(n => n.type === 'img' && n.props.src === madrid.image)?.props.src, madrid.image, locale);
    const links = nodes.filter(n => n.type === 'a');
    assert.equal(links.find(n => n.props.href === madrid.imageSource) && text(links.find(n => n.props.href === madrid.imageSource)).includes('Florian Wehde'), true, locale);
    assert.equal(text(links.find(n => n.props.href === madrid.imageLicenseUrl)), 'Unsplash License', locale);
    assert.ok(!serialize(current).includes('Zarateman') && !serialize(current).includes('wikimedia'), locale);
  }
});

test('the new photo belongs to Madrid only', () => {
  // Los demás perfiles se vigilan con las huellas de tests/fixtures/pre-*-catalog.json y las de las ventanas.
  const users = catalog.destinationProfiles.filter(p => p.image.includes('photo-1539037116277-4db20889f2d4'));
  assert.deepEqual(Array.from(users, p => p.id), ['es-madrid']);
});
