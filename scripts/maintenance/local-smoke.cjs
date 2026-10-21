const { spawn } = require('node:child_process');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');
const { checkSite, record } = require('./check-site.cjs');

async function localSmoke() {
  const baseUrl = 'http://127.0.0.1:3184';
  const child = spawn(process.execPath, ['--require', path.join(__dirname, 'network-guard.cjs'),
    'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3184'], {
    stdio: ['ignore', 'ignore', 'pipe'], env: { ...process.env, MAINTENANCE_ALLOW_FONTS: '0',
      OPENAI_API_KEY: '', TRAVELPAYOUTS_API_TOKEN: '', RESEND_API_KEY: '',
      NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '', NEXT_PUBLIC_SUPABASE_ANON_KEY: '' },
  });
  child.stderr.on('data', () => {});
  let exited = false;
  const closed = new Promise(resolve => child.once('exit', () => { exited = true; resolve(); }));
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60 && !exited; attempt++) {
      try {
        const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1000), redirect: 'error' });
        await response.body?.cancel();
        if (response.ok) { ready = true; break; }
      } catch { /* The server is still starting. */ }
      await delay(250);
    }
    if (!ready) throw Error('La compilación local no pudo arrancar');
    const results = await checkSite({ baseUrl });
    record(results, 'local-pages');
    return results.every(row => row.ok);
  } finally {
    child.kill();
    await Promise.race([closed, delay(2000)]);
    if (!exited) child.kill('SIGKILL');
  }
}
module.exports = { localSmoke };
if (require.main === module) localSmoke().then(ok => { process.exitCode = ok ? 0 : 1; })
  .catch(error => { console.error(error.message); process.exitCode = 1; });
