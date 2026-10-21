const fs = require('node:fs');
const path = require('node:path');

const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const pages = [
  { path: '/', type: 'text/html', markers: ['id="buscador-vuelos"', 'id="buscador-hoteles"', 'id="destinations-carousel"'] },
  ...['primavera','verano','otono','invierno'].map(season => ({
    path: `/temporadas/${season}`, type: 'text/html', markers: [`id="${season}-carousel"`, '<h1'],
  })),
  ...months.map(month => ({ path: `/viajes-baratos/${month}`, type: 'text/html', markers: ['Viajes recomendados', 'Ver destino', 'Buscar vuelos'] })),
  { path: '/destinos/roma', type: 'text/html', markers: ['<h1', 'Roma', 'Estancia recomendada'] },
  { path: '/auth/reset-password', type: 'text/html', markers: ['Destinauta', 'contraseña'] },
  { path: '/sitemap.xml', type: 'xml', markers: ['<urlset', 'https://destinauta.com/viajes-baratos/'] },
  { path: '/robots.txt', type: 'text/plain', markers: ['Disallow: /api/', 'https://destinauta.com/sitemap.xml'] },
];
function safeBase(value) {
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/') throw Error('Base no permitida');
  if (url.origin === 'https://destinauta.com' ||
      (url.protocol === 'http:' && url.hostname === '127.0.0.1' && url.port)) return url;
  throw Error('Solo se permite destinauta.com o el servidor local');
}
async function probe(page, { baseUrl = 'https://destinauta.com', fetcher = fetch, timeoutMs = 10000 } = {}) {
  const base = safeBase(baseUrl), started = Date.now();
  if (!pages.some(allowed => allowed.path === page.path)) throw Error('Ruta no permitida');
  let reason = 'network', status = 0;
  for (let attempt = 1; attempt <= 2; attempt++) {
    let url = new URL(page.path, base);
    try {
      const signal = AbortSignal.timeout(timeoutMs);
      let response;
      for (let redirect = 0; redirect <= 3; redirect++) {
        response = await fetcher(url, { method: 'GET', redirect: 'manual', signal,
          headers: { 'User-Agent': 'Destinauta-Daily-Maintenance/1.0', Accept: page.type } });
        status = response.status;
        if (![301,302,303,307,308].includes(status)) break;
        const location = response.headers.get('location');
        await response.body?.cancel();
        if (!location || redirect === 3) throw Error('redirect');
        const target = new URL(location, url);
        if (target.origin !== base.origin || target.pathname !== url.pathname || target.search || target.hash || target.username || target.password) {
          return { path: page.path, ok: false, status, reason: 'unsafe-redirect', attempts: attempt, ms: Date.now() - started };
        }
        url = target;
      }
      if (status !== 200) {
        reason = `http-${status}`;
        await response.body?.cancel();
        if (status < 500 && status !== 429 && status !== 408) break;
        continue;
      }
      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes(page.type)) { reason = 'content-type'; await response.body?.cancel(); break; }
      const text = await response.text();
      if (text.length > 2000000 || !page.markers.every(marker => text.toLowerCase().includes(marker.toLowerCase()))) {
        reason = 'content'; break;
      }
      return { path: page.path, ok: true, status, attempts: attempt, ms: Date.now() - started };
    } catch (error) {
      reason = ['TimeoutError','AbortError'].includes(error.name) ? 'timeout' : 'network';
    }
  }
  return { path: page.path, ok: false, status, reason, ms: Date.now() - started };
}
async function checkSite(options = {}) {
  const results = [];
  // Three simultaneous static HTTP requests; no scripts, images, forms or /api calls.
  for (let offset = 0; offset < pages.length; offset += 3) {
    results.push(...await Promise.all(pages.slice(offset, offset + 3).map(page => probe(page, options))));
  }
  return results;
}
function render(results, title) {
  return `## ${title}\n\n| Página | Resultado | HTTP | Tiempo |\n|---|---|---|---|\n` + results.map(row =>
    `| ${row.path} | ${row.ok ? 'OK' : row.reason} | ${row.status} | ${row.ms} ms |`).join('\n') + '\n';
}
function record(results, name = 'public-pages') {
  const summary = render(results, name === 'local-pages' ? 'Páginas de la compilación local' : 'Disponibilidad de destinauta.com');
  fs.mkdirSync('.maintenance', { recursive: true });
  fs.writeFileSync(path.join('.maintenance', `${name}.json`), JSON.stringify(results, null, 2));
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
}
module.exports = { pages, safeBase, probe, checkSite, record };
if (require.main === module) checkSite().then(results => {
  record(results); process.exitCode = results.every(row => row.ok) ? 0 : 1;
}).catch(() => { console.error('No se pudo completar la revisión HTTP'); process.exitCode = 1; });
