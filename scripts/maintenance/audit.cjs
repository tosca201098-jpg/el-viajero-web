const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

function parseAudit(stdout, exitCode) {
  let data;
  try { data = JSON.parse(stdout); } catch { return { available: false }; }
  const counts = data.metadata?.vulnerabilities;
  if (data.error || ![0,1].includes(exitCode) || !counts ||
      !['low','moderate','high','critical','total'].every(key => Number.isInteger(counts[key]) && counts[key] >= 0)) return { available: false };
  const packages = Object.values(data.vulnerabilities ?? {}).map(item => ({
    name: String(item.name).replace(/[^a-zA-Z0-9@/_.-]/g, '').slice(0,120),
    severity: ['low','moderate','high','critical'].includes(item.severity) ? item.severity : 'unknown',
    direct: Boolean(item.isDirect),
    advisories: (item.via ?? []).filter(via => typeof via === 'object' && /^https:\/\/github\.com\/advisories\/GHSA-[a-z0-9-]+$/.test(via.url))
      .map(via => via.url),
    fixAvailable: Boolean(item.fixAvailable),
  }));
  return { available: true, counts: Object.fromEntries(['low','moderate','high','critical','total'].map(key => [key,counts[key]])), packages };
}
function runAudit(omitDev = false) {
  const args = ['audit','--json','--package-lock-only','--ignore-scripts','--registry=https://registry.npmjs.org', ...(omitDev ? ['--omit=dev'] : [])];
  const npmCli = process.env.npm_execpath;
  const useNode = npmCli && fs.existsSync(npmCli) && npmCli.endsWith('npm-cli.js');
  const command = useNode ? process.execPath : process.platform === 'win32' ? process.env.ComSpec ?? 'cmd.exe' : 'npm';
  const commandArgs = useNode ? [npmCli, ...args] : process.platform === 'win32' ? ['/d','/s','/c', 'npm.cmd ' + args.join(' ')] : args;
  const result = spawnSync(command, commandArgs, { encoding: 'utf8', timeout: 120000, maxBuffer: 8000000,
    env: { ...process.env, npm_config_fetch_retries: '1', npm_config_fetch_timeout: '30000' } });
  return parseAudit(result.stdout, result.status);
}
function renderAudit(result, title) {
  if (!result.available) return `### ${title}\n\nNo se pudo consultar la base de avisos npm. Revisión incompleta, no significa cero vulnerabilidades.\n`;
  const c = result.counts;
  return `### ${title}\n\nTotal: **${c.total}** (Low ${c.low}, Moderate ${c.moderate}, High ${c.high}, Critical ${c.critical}).\n\n` +
    result.packages.map(p => `- ${p.name}: ${p.severity}; ${p.direct ? 'directa' : 'transitiva'}; corrección disponible: ${p.fixAvailable ? 'sí' : 'no'}. ${p.advisories.join(' ')}`).join('\n') + '\n';
}
module.exports = { parseAudit, runAudit, renderAudit };
if (require.main === module) {
  const all = runAudit(), production = runAudit(true);
  fs.mkdirSync('.maintenance', { recursive: true });
  fs.writeFileSync('.maintenance/audit.json', JSON.stringify({ all, production }, null, 2));
  const summary = '## Auditoría de dependencias (sin correcciones automáticas)\n\n' + renderAudit(all,'Catálogo completo') + '\n' + renderAudit(production,'Sin dependencias de desarrollo');
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT,
    `total=${all.available ? all.counts.total : 'unavailable'}\nproduction=${production.available ? production.counts.total : 'unavailable'}\n`);
  process.exitCode = !all.available || !production.available || all.counts.total > 0 || production.counts.total > 0 ? 1 : 0;
}
