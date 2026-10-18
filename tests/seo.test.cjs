const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(file, dependencies = {}) {
  const exports = {};
  const output = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(output, { exports, require: (id) => dependencies[id] ?? require(id) }, { filename: file });
  return exports;
}

const seo = load('lib/seo.ts');
const months = load('lib/destinations/months.ts');

test('sitemap contains only the homepage and twelve public month pages on the official domain', () => {
  const entries = load('app/sitemap.ts', {
    '@/lib/destinations/months': months,
    '@/lib/seo': seo,
  }).default();
  assert.equal(entries.length, 13);
  assert.deepEqual(Array.from(entries, ({ url }) => url), [
    'https://destinauta.com',
    ...months.spanishMonthSlugs.map((month) => `https://destinauta.com/viajes-baratos/${month}`),
  ]);
  assert.equal(new Set(entries.map(({ url }) => url)).size, 13);
});

test('robots allows public pages, blocks APIs and announces the official sitemap', () => {
  const result = load('app/robots.ts', { '@/lib/seo': seo }).default();
  assert.equal(result.rules.userAgent, '*');
  assert.equal(result.rules.allow, '/');
  assert.equal(result.rules.disallow, '/api/');
  assert.equal(result.sitemap, 'https://destinauta.com/sitemap.xml');
});
