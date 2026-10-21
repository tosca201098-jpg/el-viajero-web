const fs = require('node:fs');
const { normalizeChecks } = require('./summary.cjs');
const marker = '<!-- destinauta-daily-maintenance:v1 -->';
const title = '[Mantenimiento diario] Fallos detectados en DESTINAUTA';
function reportData(needs, runUrl) {
  const quality = needs?.quality ?? {}, pages = needs?.['public-pages'] ?? {};
  let checks = {};
  try { checks = JSON.parse(quality.outputs?.checks ?? '{}'); } catch { /* Incomplete output must fail closed. */ }
  checks = normalizeChecks(checks);
  const healthy = quality.result === 'success' && pages.result === 'success' && Object.values(checks).every(status => status === 'success');
  const count = value => /^\d{1,6}$/.test(value ?? '') ? value : 'no disponible';
  const status = value => ['success','failure','cancelled','skipped'].includes(value) ? value : 'incompleto';
  const body = `${marker}\n## ${healthy ? 'Revisión recuperada' : 'Revisión con fallos o incompleta'}\n\n` +
    `Última ejecución: ${new Date().toISOString()}\n\n[Informe y registros de GitHub Actions](${runUrl})\n\n` +
    `| Área | Resultado |\n|---|---|\n| Calidad del código | ${status(quality.result)} |\n| Páginas públicas | ${status(pages.result)} |\n` +
    Object.entries(checks).map(([name,value]) => `| ${name} | ${value} |`).join('\n') +
    `\n\nAvisos npm: ${count(quality.outputs?.audit_total)} en total; ${count(quality.outputs?.audit_production)} sin dev.\n\n` +
    'Los avisos npm requieren valorar su exposición; no prueban por sí solos que la aplicación sea explotable. No se han aplicado correcciones, despliegues ni llamadas de pago. Esta misma incidencia se actualiza/reabre para evitar duplicados.';
  return { healthy, body };
}
async function syncIncident({ api, needs, runUrl }) {
  const { healthy, body } = reportData(needs, runUrl);
  let existing;
  for (let page = 1; ; page++) {
    const issues = await api('GET', `/issues?state=all&sort=created&direction=desc&per_page=100&page=${page}`);
    existing = issues.find(issue => !issue.pull_request && (issue.body ?? '').includes(marker));
    if (existing || issues.length < 100) break;
  }
  if (healthy) {
    if (existing?.state === 'open') {
      await api('PATCH', `/issues/${existing.number}`, { body, state: 'closed', state_reason: 'completed' });
      return 'closed';
    }
    return 'healthy';
  }
  if (existing) {
    await api('PATCH', `/issues/${existing.number}`, { body, title, state: 'open', ...(existing.state === 'closed' ? { state_reason: 'reopened' } : {}) });
    return existing.state === 'closed' ? 'reopened' : 'updated';
  }
  await api('POST', '/issues', { title, body });
  return 'created';
}
module.exports = { marker, title, reportData, syncIncident };
if (require.main === module) {
  const env = process.env;
  const authorized = env.GITHUB_REPOSITORY === 'tosca201098-jpg/el-viajero-web' &&
    ['schedule','workflow_dispatch'].includes(env.GITHUB_EVENT_NAME) && env.GITHUB_REF === 'refs/heads/main';
  if (!authorized || !env.GITHUB_TOKEN || !/^\d+$/.test(env.GITHUB_RUN_ID ?? '')) {
    console.error('El informe requiere una ejecución autorizada en main y el token efímero de Actions.');
    process.exitCode = 1;
  } else {
    const runUrl = `https://github.com/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`;
    const api = async (method, route, body) => {
      const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPOSITORY}${route}`, {
        method, redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (!response.ok) throw Error(`GitHub Issues respondió HTTP ${response.status}; consulta permisos/incidencias habilitadas.`);
      return response.json();
    };
    syncIncident({ api, needs: JSON.parse(env.MAINTENANCE_NEEDS ?? '{}'), runUrl }).then(result => {
      console.log(`Incidencia de mantenimiento: ${result}`);
      if (env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY, `## Incidencia de mantenimiento\n\n${result}. [Registros](${runUrl})\n`);
    }).catch(error => { console.error(error.message); process.exitCode = 1; });
  }
}
