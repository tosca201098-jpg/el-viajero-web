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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
  }).outputText;
  vm.runInNewContext(output, {
    exports,
    require: id => {
      if (Object.prototype.hasOwnProperty.call(dependencies, id)) return dependencies[id];
      throw new Error('Unexpected dependency: ' + id);
    },
    URL,
    React: { createElement: (component, props) => ({ component, props }) },
  }, { filename: file });
  return exports;
}

const months = load('lib/destinations/months.ts');
const seo = load('lib/seo.ts');
const notFoundError = new Error('404');
const component = () => null;
const page = load('app/viajes-baratos/[mes]/page.tsx', {
  'next/navigation': { notFound: () => { throw notFoundError; } },
  '@/lib/destinations/months': months,
  '@/lib/destinations/monthly': { getMonthlyRecommendations: month => [{ marker: month }] },
  '@/lib/seo': seo,
  './MonthlyDestinations': { default: component },
});

test('async route parameters preserve every monthly page and its public SEO URLs', async () => {
  assert.equal(page.dynamicParams, false);
  assert.deepEqual(Array.from(page.generateStaticParams(), ({ mes }) => mes), Array.from(months.spanishMonthSlugs));
  for (const [index, mes] of Array.from(months.spanishMonthSlugs).entries()) {
    const params = Promise.resolve({ mes });
    const metadata = await page.generateMetadata({ params });
    assert.equal(metadata.metadataBase.origin, 'https://destinauta.com');
    assert.equal(metadata.alternates.canonical, `/viajes-baratos/${mes}`);
    assert.equal(metadata.openGraph.url, `/viajes-baratos/${mes}`);
    assert.equal(metadata.title, `Viajes recomendados en ${mes} | Destinauta`);
    const rendered = await page.default({ params });
    assert.equal(rendered.component, component);
    assert.equal(rendered.props.month, index + 1);
    assert.equal(rendered.props.recommendations[0].marker, index + 1);
  }
});

test('invalid async month parameters keep returning notFound for metadata and page content', async () => {
  for (const mes of ['francia', 'foobar', '', 'ENERO']) {
    const params = Promise.resolve({ mes });
    await assert.rejects(page.generateMetadata({ params }), error => error === notFoundError);
    await assert.rejects(page.default({ params }), error => error === notFoundError);
  }
});
