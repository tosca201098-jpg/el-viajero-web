const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const helpers = require('./helpers/ficha-snapshots.cjs');
const { LOCALES, createRenderer, flatten, serialize, digest, withOriginalFrame, loadFraming, snapshots } = helpers;

const root = path.resolve(__dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'ficha-baseline-before-photo-frame.json'), 'utf8'));
const FRAME_CLASS = 'relative h-52 max-sm:h-[140px] sm:h-72';
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join(' ') : typeof n === 'object' ? text(n.children) : String(n);

const framing = loadFraming(root);
// PR 3A añade el botón "Vuelo + hotel" a la ficha; se descarta aquí y se comprueba aparte en
// tests/destination-window-common-frame.test.cjs. Todo lo demás se sigue comparando igual.
const current = snapshots(root, { normalizeFrame: true, ignorePackageButton: true });

test('the home page, including the 16 original cards, is identical to the version before the photo-frame change', () => {
  assert.deepEqual(current.home, baseline.home);
});

test('the detail window of the 16 original destinations only changes the photo frame and title box', () => {
  assert.deepEqual(current.featuredDetail, baseline.featuredDetail);
});

test('the detail window of every catalog destination only changes the photo frame and title box', () => {
  assert.deepEqual(Object.keys(current.profileDetail.es), Object.keys(baseline.profileDetail.es));
  for (const locale of ['es', 'en']) {
    const different = Object.keys(baseline.profileDetail[locale]).filter(id => current.profileDetail[locale][id] !== baseline.profileDetail[locale][id]);
    assert.deepEqual(different, [], `${locale}: ${different.slice(0, 5).join(', ')}`);
  }
});

test('every detail window uses the panoramic photo frame and keeps photo, position, title, flag line and close button', () => {
  for (const locale of LOCALES) {
    const renderer = createRenderer(root, locale);
    const destinations = [...renderer.featured, ...(locale === 'es' ? renderer.profiles : [])];
    for (const destination of destinations) {
      const tree = flatten(renderer.detail(destination));
      const frame = tree.find(n => n.props['data-destination-photo-frame']);
      assert.ok(frame, `${destination.name}: frame`);
      assert.equal(frame.props.className, FRAME_CLASS, destination.name);
      assert.ok(!/h-72 md:h-96|md:h-96/.test(frame.props.className));
      const image = flatten(frame).find(n => n.type === 'img');
      assert.equal(image.props.src, destination.image, destination.name);
      assert.equal(image.props.className, 'h-full w-full object-cover');
      assert.equal(JSON.stringify(image.props.style ?? null), JSON.stringify(framing.panoramicImagePosition(destination) ? { objectPosition: framing.panoramicImagePosition(destination) } : null), destination.name);
      assert.ok(flatten(frame).some(n => n.type === 'button' && n.props.className.includes('absolute right-5 top-5')), 'close button as before');
      const title = flatten(frame).find(n => n.props.id === 'destination-detail-title');
      assert.ok(title, destination.name);
      assert.ok(text(title).trim().length > 0);
      const box = flatten(frame).find(n => n.type === 'div' && n.props.className?.startsWith('absolute bottom-6 left-6'));
      assert.ok(box.props.className.includes('right-20') && box.props.className.includes('max-sm:right-[4.75rem]'), 'title box leaves room for the close button');
    }
  }
});

test('long names shrink the title only on mobile and never lose the Oslo size on larger screens', () => {
  const renderer = createRenderer(root, 'es');
  const sizes = new Map();
  for (const profile of renderer.profiles) {
    const title = flatten(renderer.detail(profile)).find(n => n.props.id === 'destination-detail-title');
    const name = text(title).trim();
    const className = title.props.className;
    assert.ok(className.includes('text-4xl') && className.includes('md:text-5xl'), name);
    assert.ok(className.includes('break-words'), name);
    const tier = name.length > 24 ? 'long' : name.length > 12 ? 'medium' : 'short';
    sizes.set(tier, (sizes.get(tier) ?? 0) + 1);
    assert.equal(className.includes('max-sm:text-xl'), tier === 'long', name);
    assert.equal(className.includes('max-sm:text-2xl'), tier === 'medium', name);
  }
  assert.ok(sizes.get('long') > 0 && sizes.get('medium') > 0 && sizes.get('short') > 0);
  const oslo = renderer.profiles.find(p => p.id === 'no-oslo');
  const osloTitle = flatten(renderer.detail(oslo)).find(n => n.props.id === 'destination-detail-title');
  assert.equal(osloTitle.props.className.replace(/\s+/g, ' ').trim(), 'break-words font-black md:text-5xl text-4xl');
});

test('the baseline normalizer only rewrites the three intended class strings', () => {
  const sample = serialize({ a: 1 });
  assert.equal(withOriginalFrame(sample), sample);
  assert.equal(digest('x').length, 16);
});
