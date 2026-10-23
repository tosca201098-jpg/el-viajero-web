const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'app/vuelos/page.tsx'), 'utf8');

test('dedicated flight page mounts both official widget containers before loading the approved script', () => {
  const search = page.indexOf('id="tpwl-search"');
  const tickets = page.indexOf('id="tpwl-tickets"');
  const script = page.indexOf('https://tpemd.com/wl_web/main.js?wl_id=23773');
  assert.ok(search >= 0 && tickets > search && script > tickets);
  assert.match(page, /strategy="afterInteractive"/);
  assert.match(page, /script\.type = "module"/);
  assert.doesNotMatch(page, /TRAVELPAYOUTS_API_TOKEN|NEXT_PUBLIC_.*TOKEN/);
});

test('widget integration is confined to its own route', () => {
  const home = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
  assert.doesNotMatch(home, /tpwl-search|tpwl-tickets|wl_id=23773/);
});
