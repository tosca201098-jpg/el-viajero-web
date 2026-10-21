const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const nested = require('postcss-nested');

// Captured with Tailwind 3.4.19 and parser 6.1.5 before the security override.
// Keep variants that mutate selector trees: parser 7 changes insertion iteration.
test('Tailwind variants preserve the CSS produced before the parser update', async () => {
  const result = await postcss([tailwind({
    content: [{ raw: 'flex md:grid md:grid-cols-2 hover:bg-blue-500 focus-visible:ring-2 group-hover:opacity-100 peer-checked:block disabled:opacity-50 space-x-2 -mt-2 w-[calc(100%-1rem)] [&>a]:underline data-[state=open]:block before:content-[\'\']', extension: 'html' }],
    corePlugins: { preflight: false },
  })]).process('@tailwind utilities;', { from: undefined });
  assert.equal(createHash('sha256').update(result.css).digest('hex'), 'c290494319731b40dc466d6d26818850a5cf714d420511dcda404a8cd7528567');
});

test('nested selectors retain parents, lists, pseudo selectors and media rules', async () => {
  const result = await postcss([nested()]).process(
    '.card, .panel { color: red; &:hover, &:focus { color: blue; } > a { text-decoration: none; } @media (min-width: 768px) { &[data-open="true"] { display: grid; } } }',
    { from: undefined },
  );
  assert.equal(result.css, '.card, .panel { color: red; } .card:hover, .card:focus, .panel:hover, .panel:focus { color: blue; } .card > a, .panel > a { text-decoration: none; } @media (min-width: 768px) { .card[data-open="true"], .panel[data-open="true"] { display: grid; } }');
});

test('large flat selectors complete within a bounded subprocess (GHSA-rj75-hqrm-r3gf)', () => {
  // Guard the workload from the advisory without hanging the entire test suite.
  const parserPath = require.resolve('postcss-selector-parser', { paths: [require.resolve('tailwindcss')] });
  const result = spawnSync(process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const parser = require(${JSON.stringify(parserPath)});
    const selector = '.a'.repeat(200000);
    const ast = parser().astSync(selector);
    assert.equal(ast.first.nodes.length, 200000);
    assert.equal(ast.toString(), selector);
  `], { timeout: 10000, encoding: 'utf8' });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
});
