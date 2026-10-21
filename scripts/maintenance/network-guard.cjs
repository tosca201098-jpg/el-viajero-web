// Preload in tests/build workers. No app code or runtime configuration is changed.
const net = require('node:net');
const http = require('node:http');
const https = require('node:https');
const tls = require('node:tls');
const { syncBuiltinESMExports } = require('node:module');

function allowedHost(host) {
  const normalized = String(host ?? '').replace(/^\[|\]$/g, '').toLowerCase();
  return ['localhost', '127.0.0.1', '::1'].includes(normalized) ||
    (process.env.MAINTENANCE_ALLOW_FONTS === '1' &&
      ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(normalized));
}
function blocked() {
  const error = new Error('Mantenimiento: conexión externa bloqueada; utiliza una simulación.');
  error.code = 'MAINTENANCE_NETWORK_BLOCKED';
  throw error;
}
function requestHost(args) {
  const value = args[0];
  if (typeof value === 'string' || value instanceof URL) return new URL(value).hostname;
  return value?.hostname ?? value?.host?.split(':')[0] ?? 'localhost';
}
for (const api of [http, https]) {
  for (const method of ['request', 'get']) {
    const original = api[method];
    api[method] = function (...args) {
      if (!allowedHost(requestHost(args))) blocked();
      return original.apply(this, args);
    };
  }
}
const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const value = Array.isArray(args[0]) ? args[0][0] : args[0];
  // IPC/unix sockets are used internally by Node/Next workers.
  const host = typeof value === 'object' ? value?.host ?? 'localhost'
    : typeof value === 'number' ? typeof args[1] === 'string' ? args[1] : 'localhost'
    : 'localhost';
  if (!allowedHost(host)) blocked();
  return connect.apply(this, args);
};
const tlsConnect = tls.connect;
tls.connect = function (...args) {
  const value = args[0];
  const host = typeof value === 'object' ? value?.host ?? value?.servername ?? 'localhost'
    : typeof args[1] === 'string' ? args[1] : 'localhost';
  if (!allowedHost(host)) blocked();
  return tlsConnect.apply(this, args);
};
const originalFetch = globalThis.fetch;
globalThis.fetch = async function (input, init) {
  const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (!allowedHost(url.hostname)) blocked();
  return originalFetch(input, init);
};
syncBuiltinESMExports();
