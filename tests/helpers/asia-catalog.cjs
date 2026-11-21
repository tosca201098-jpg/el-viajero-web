// Carga lib/destinations/asia.ts junto con todos los módulos de país y plantillas que importa,
// sin listarlos a mano: al añadir un país nuevo a asia.ts, las pruebas lo encuentran solas.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

function loadAsiaCatalog(load) {
  const cache = new Map();
  function loadModule(name) {
    if (cache.has(name)) return cache.get(name);
    const file = `lib/destinations/${name}.ts`;
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const dependencies = {};
    for (const match of source.matchAll(/^import\s+(?!type\b)[^;]*?from\s+'\.\/([a-z0-9-]+)'/gm)) {
      dependencies[`./${match[1]}`] = loadModule(match[1]);
    }
    const loaded = load(file, dependencies);
    cache.set(name, loaded);
    return loaded;
  }
  return loadModule('asia');
}
module.exports = { loadAsiaCatalog };
