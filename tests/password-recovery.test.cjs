const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(file) {
  const exports = {};
  const output = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(output, { exports, URL, URLSearchParams, Date }, { filename: file });
  return exports;
}

function renderAuthDialog(resetResponse) {
  const states = [], refs = [], calls = [];
  let stateIndex = 0, refIndex = 0;
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState(initial) {
      const index = stateIndex++;
      if (!(index in states)) states[index] = initial;
      return [states[index], (value) => { states[index] = value; }];
    },
    useRef(initial) {
      const index = refIndex++;
      if (!(index in refs)) refs[index] = { current: initial };
      return refs[index];
    },
    useEffect() {},
  };
  const auth = { resetPasswordForEmail: async (...args) => { calls.push(args); return resetResponse; } };
  const exports = {};
  const output = ts.transpileModule(fs.readFileSync(path.join(root, 'app/components/AuthDialog.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(output, {
    exports, React: react,
    require: (id) => ({
      react,
      './LanguageProvider': { useLanguage: () => ({ t: (key) => translate('es', key), text: (value) => value }) },
      '@/lib/supabase/client': { getSupabaseClient: () => ({ auth }) },
      '@/lib/seo': { siteUrl: 'https://destinauta.com' },
    })[id],
  });
  const render = () => { stateIndex = 0; refIndex = 0; return exports.default({ mode: 'signin', onClose() {} }); };
  const find = (node, predicate) => {
    if (!node || typeof node !== 'object') return null;
    if (predicate(node)) return node;
    for (const child of node.children || []) {
      const found = find(child, predicate);
      if (found) return found;
    }
    return null;
  };
  return { render, find, calls };
}

const recovery = load('lib/supabase/password-recovery.ts');
const { translate, locales, dictionaries } = load('lib/i18n/translations.ts');

test('only a recovery callback is eligible; errors and direct visits are rejected', () => {
  assert.equal(recovery.getRecoveryLinkState('https://destinauta.com/auth/reset-password#type=recovery&access_token=secret&refresh_token=secret'), 'pending');
  assert.equal(recovery.getRecoveryLinkState('https://destinauta.com/auth/reset-password?code=one-time-code'), 'pending');
  for (const url of [
    'https://destinauta.com/auth/reset-password',
    'https://destinauta.com/auth/reset-password#type=signup&access_token=secret&refresh_token=secret',
    'https://destinauta.com/auth/reset-password#type=recovery&access_token=secret',
    'https://destinauta.com/auth/reset-password#error=access_denied&error_code=otp_expired',
    'https://destinauta.com/auth/reset-password?error=access_denied&error_code=otp_expired',
  ]) assert.equal(recovery.getRecoveryLinkState(url), 'invalid', url);
});

test('ordinary sign-in, absent and expired sessions cannot enable password update', () => {
  const valid = { user: { id: 'test-user' }, expires_at: Math.floor(Date.now() / 1000) + 600 };
  const expired = { user: { id: 'test-user' }, expires_at: Math.floor(Date.now() / 1000) - 600 };
  assert.equal(recovery.isFreshRecoverySession('PASSWORD_RECOVERY', valid), true);
  assert.equal(recovery.isFreshRecoverySession('SIGNED_IN', valid), false);
  assert.equal(recovery.isFreshRecoverySession('INITIAL_SESSION', valid), false);
  assert.equal(recovery.isFreshRecoverySession('PASSWORD_RECOVERY', expired), false);
  assert.equal(recovery.isFreshRecoverySession('PASSWORD_RECOVERY', null), false);
});

test('new password requires six matching characters, consistent with signup', () => {
  assert.equal(recovery.validateNewPassword('short', 'short'), 'short');
  assert.equal(recovery.validateNewPassword('123456', '123456'), null);
  assert.equal(recovery.validateNewPassword('long-enough', 'different'), 'mismatch');
  assert.equal(recovery.validateNewPassword('long-enough', 'long-enough'), null);
});

test('verified recovery user can update password; other or expired users cannot', async () => {
  const calls = [];
  const auth = {
    getUser: async () => ({ data: { user: { id: 'recovered-user' } }, error: null }),
    updateUser: async (attributes) => { calls.push(attributes); return { error: null }; },
  };
  assert.equal(await recovery.changeRecoveredPassword(auth, 'recovered-user', 'new-password'), 'success');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].password, 'new-password');
  assert.equal(await recovery.changeRecoveredPassword(auth, 'different-user', 'new-password'), 'invalid');
  assert.equal(calls.length, 1);
  auth.getUser = async () => ({ data: { user: null }, error: { message: 'expired' } });
  assert.equal(await recovery.changeRecoveredPassword(auth, 'recovered-user', 'new-password'), 'invalid');
  assert.equal(calls.length, 1);
});

test('provider password errors are classified without exposing details', async () => {
  const auth = {
    getUser: async () => ({ data: { user: { id: 'recovered-user' } }, error: null }),
    updateUser: async () => ({ error: { code: 'weak_password' } }),
  };
  assert.equal(await recovery.changeRecoveredPassword(auth, 'recovered-user', 'new-password'), 'weak');
  auth.updateUser = async () => ({ error: { code: 'provider_detail' } });
  assert.equal(await recovery.changeRecoveredPassword(auth, 'recovered-user', 'new-password'), 'error');
});

test('forgot-password form sends the email to Supabase with only the approved redirect', async () => {
  const ui = renderAuthDialog({ error: null });
  const forgot = ui.find(ui.render(), (node) => node.type === 'button' && String(node.children).includes('¿Has olvidado'));
  assert.ok(forgot);
  forgot.props.onClick();
  const email = ui.find(ui.render(), (node) => node.type === 'input' && node.props.type === 'email');
  email.props.onChange({ target: { value: '  usuario@example.com  ' } });
  const form = ui.find(ui.render(), (node) => node.type === 'form');
  await form.props.onSubmit({ preventDefault() {} });
  assert.equal(ui.calls[0][0], 'usuario@example.com');
  assert.equal(ui.calls[0][1].redirectTo, 'https://destinauta.com/auth/reset-password');
  const message = ui.find(ui.render(), (node) => node.type === 'p' && node.props.role === 'status');
  assert.equal(message.children[0], dictionaries.es['auth.resetSent']);
});

test('an unknown email receives the same public confirmation', async () => {
  const ui = renderAuthDialog({ error: { code: 'user_not_found', status: 400 } });
  ui.find(ui.render(), (node) => node.type === 'button' && String(node.children).includes('¿Has olvidado')).props.onClick();
  ui.find(ui.render(), (node) => node.type === 'input' && node.props.type === 'email').props.onChange({ target: { value: 'unknown@example.com' } });
  await ui.find(ui.render(), (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  const message = ui.find(ui.render(), (node) => node.type === 'p' && node.props.role === 'status');
  assert.equal(message.children[0], dictionaries.es['auth.resetSent']);
});

test('rate limiting displays a safe retry error', async () => {
  const ui = renderAuthDialog({ error: { code: 'over_email_send_rate_limit', status: 429 } });
  ui.find(ui.render(), (node) => node.type === 'button' && String(node.children).includes('¿Has olvidado')).props.onClick();
  ui.find(ui.render(), (node) => node.type === 'input' && node.props.type === 'email').props.onChange({ target: { value: 'user@example.com' } });
  await ui.find(ui.render(), (node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  const error = ui.find(ui.render(), (node) => node.type === 'p' && node.props.role === 'alert');
  assert.equal(error.children[0], dictionaries.es['auth.rateLimit']);
});

test('recovery UI is translated in all seven languages and confirmation is generic', () => {
  const keys = ['forgotPassword', 'forgotTitle', 'sendReset', 'resetSent', 'resetSendError', 'backToSignIn',
    'resetTitle', 'resetChecking', 'resetInvalid', 'resetSuccess', 'newPassword', 'confirmPassword',
    'resetShort', 'resetMismatch', 'resetUpdateError', 'changePassword'];
  assert.equal(locales.length, 7);
  for (const { code } of locales) {
    for (const key of keys) assert.ok(dictionaries[code][`auth.${key}`], `${code}: ${key}`);
    assert.ok(translate(code, 'auth.resetSent').length > 30);
  }
  assert.ok(dictionaries.es['auth.resetSent'].startsWith('Si existe'));
  assert.ok(!dictionaries.es['auth.resetSent'].includes('{email}'));
});
