const fs = require('node:fs');
const keys = ['install','tests','typescript','lint','build','smoke','audit'];
function normalizeChecks(input) {
  return Object.fromEntries(keys.map(key => [key, ['success','failure','cancelled','skipped'].includes(input?.[key]) ? input[key] : 'skipped']));
}
module.exports = { normalizeChecks };
if (require.main === module) {
  const checks = normalizeChecks(JSON.parse(process.env.CHECKS_JSON ?? '{}'));
  const summary = '## Calidad del código\n\n| Comprobación | Resultado |\n|---|---|\n' +
    Object.entries(checks).map(([name, status]) => `| ${name} | ${status} |`).join('\n') + '\n';
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `checks=${JSON.stringify(checks)}\n`);
  process.exitCode = Object.values(checks).every(status => status === 'success') ? 0 : 1;
}
