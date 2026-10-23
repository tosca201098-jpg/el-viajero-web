const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'app/vuelos/page.tsx'), 'utf8');

test('flight results page retains provider containers but hides the second form', () => {
  const search = page.indexOf('id="tpwl-search"');
  const tickets = page.indexOf('id="tpwl-tickets"');
  const script = page.indexOf('https://tpemd.com/wl_web/main.js?wl_id=23773');
  assert.ok(search >= 0 && tickets > search && script > tickets);
  assert.match(page, /id="tpwl-search" hidden aria-hidden="true"/);
  assert.match(page, /hasSearch && <Script/);
  assert.match(page, /strategy="afterInteractive"/);
  assert.match(page, /script\.type = "module"/);
  assert.doesNotMatch(page, /TRAVELPAYOUTS_API_TOKEN|NEXT_PUBLIC_.*TOKEN/);
});

test('home only mounts the official widget for a validated featured search', () => {
  const home = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
  assert.match(home, /featuredFlightSearch && <Script/);
  assert.match(home, /featuredFlightSearch\?\.destination === destinoSeleccionado && <section/);
  assert.match(home, /id="tpwl-search" hidden aria-hidden="true"/);
  assert.match(home, /id="tpwl-tickets"/);
  assert.match(home, /id="tpwl-tickets"[^>]*\/>\s*<p[^>]*>\{t\("search\.widgetNoFlightsHint"\)\}<\/p>/);
  assert.match(home, /https:\/\/tpemd\.com\/wl_web\/main\.js\?wl_id=23773/);
  assert.doesNotMatch(home, /TRAVELPAYOUTS_API_TOKEN|NEXT_PUBLIC_.*TOKEN/);
});

test('home restores the featured card after the widget rewrites its URL and clears it on close', () => {
  const home = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
  assert.match(home, /saved\?\.search === search/);
  assert.match(home, /featuredDestinationForSearch\(search, slug\)/);
  assert.match(home, /sessionStorage\.setItem\(storageKey/);
  assert.match(home, /sessionStorage\.removeItem\("destinauta\.featured-flight-context"\)/);
  assert.match(home, /if \(event\.key === "Escape"\) \{\s*if \(featuredFlightSearch\) leaveFeaturedFlightSearch\(\)/);
});
