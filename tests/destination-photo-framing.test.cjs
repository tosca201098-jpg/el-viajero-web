const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { LOCALES, createRenderer, flatten, loadFraming } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const before = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'ficha-image-positions-before-framing.json'), 'utf8'));
const framing = loadFraming(root);
const renderer = createRenderer(root, 'es');
const FEATURED_FRAMING = { 'Nueva York': 'center 35%', Bali: 'center 30%', Maldivas: 'center 45%', 'Dubái': 'center 30%', Suiza: 'center 40%', Tailandia: 'center 30%', 'Sídney': 'center 30%', 'Río de Janeiro': 'center 40%' };
const photoFrame = tree => flatten(tree).find(n => n.props['data-destination-photo-frame']);

test('every framing value is "center N%" with N between 0 and 100', () => {
  const values = [...Object.entries(framing.imageFraming), ...Object.entries(framing.featuredImageFraming)];
  assert.ok(Object.keys(framing.imageFraming).length > 90);
  assert.equal(Object.keys(framing.featuredImageFraming).length, 8);
  for (const [key, position] of values) {
    const match = /^center (\d{1,3})%$/.exec(position);
    assert.ok(match && Number(match[1]) <= 100, `${key}: ${position}`);
  }
});

test('every framed id is a catalog destination and none of them had a position of its own', () => {
  const ids = new Set(renderer.profiles.map(p => p.id));
  for (const id of Object.keys(framing.imageFraming)) {
    assert.ok(ids.has(id), `${id} is not in the catalog`);
    assert.ok(!(id in before.profiles), `${id} already had its own position and must keep it`);
  }
});

test('no destination data object changes: positions in the data are exactly the ones that existed before', () => {
  const byId = new Map(renderer.profiles.map(p => [p.id, p]));
  assert.ok(Object.keys(before.profiles).length >= 17);
  for (const profile of renderer.profiles) assert.equal(profile.imagePosition, before.profiles[profile.id], profile.id);
  for (const [id, position] of Object.entries(before.profiles)) assert.equal(framing.panoramicImagePosition(byId.get(id)), position, `${id} keeps its own position`);
  for (const destination of renderer.featured) assert.equal(destination.imagePosition, before.featured[destination.name], destination.name);
});

test('the 16 original destinations: same names, order and photos, and the planned framing in the detail window', () => {
  assert.equal(renderer.featured.length, 16);
  assert.equal(renderer.featured[0].name, 'París');
  for (const destination of renderer.featured) {
    const expected = destination.name === 'París' ? framing.imageFraming['fr-paris'] : FEATURED_FRAMING[destination.name];
    assert.equal(framing.panoramicImagePosition(destination), expected, destination.name);
  }
  assert.equal(framing.imageFraming['fr-paris'], 'center 35%');
  assert.equal(framing.panoramicImagePosition(renderer.featured.find(d => d.name === 'Bali')), 'center 30%');
  assert.equal(framing.panoramicImagePosition(renderer.featured.find(d => d.name === 'Maldivas')), 'center 45%');
  for (const name of ['Tokio', 'Roma', 'Londres', 'Santorini', 'Islandia', 'Barcelona', 'El Cairo']) {
    assert.equal(framing.panoramicImagePosition(renderer.featured.find(d => d.name === name)), undefined, `${name} keeps the centred photo`);
  }
});

test('the home cards do not use any framing', () => {
  const home = JSON.stringify(createRenderer(root, 'es').home(), (k, v) => typeof v === 'function' ? '[fn]' : v);
  assert.ok(!/objectPosition/.test(home));
});

test('the detail window passes the framing to the photo as object-position, in all languages', () => {
  for (const locale of LOCALES) {
    const r = createRenderer(root, locale);
    for (const destination of r.featured) {
      const image = flatten(photoFrame(r.detail(destination))).find(n => n.type === 'img' && n.props.src === destination.image);
      assert.ok(image, destination.name);
      assert.equal(image.props.style?.objectPosition, framing.panoramicImagePosition(destination), `${locale} ${destination.name}`);
    }
  }
  const framed = renderer.profiles.filter(p => framing.imageFraming[p.id]);
  assert.ok(framed.length > 90);
  for (const profile of framed) {
    const image = flatten(photoFrame(renderer.detail(profile))).find(n => n.type === 'img');
    assert.equal(image.props.style.objectPosition, framing.imageFraming[profile.id], profile.id);
  }
});

test('panoramicImagePosition prefers an existing position, then the id, then the photo URL', () => {
  const url = Object.keys(framing.featuredImageFraming)[0];
  assert.equal(framing.panoramicImagePosition({ id: 'fr-paris', image: 'x', imagePosition: 'left top' }), 'left top');
  assert.equal(framing.panoramicImagePosition({ id: 'fr-paris', image: 'x' }), 'center 35%');
  assert.equal(framing.panoramicImagePosition({ image: url }), framing.featuredImageFraming[url]);
  assert.equal(framing.panoramicImagePosition({ id: 'xx-unknown', image: 'x' }), undefined);
  assert.equal(framing.panoramicImagePosition({ id: 'toString', image: 'constructor' }), undefined);
});
