// Totales esperados del catálogo calculados automáticamente (sin números escritos a mano).
// Se obtienen del registro por países (`destinationsByCountry`), que es independiente de la lista plana
// `destinationProfiles`: si una ficha se pierde, se duplica o se registra en un solo sitio, los totales dejan de coincidir.
// Los recuentos de cada lote (p. ej. Croacia 12, Grecia 39) y las huellas de las fichas previas siguen fijados en sus pruebas.
const assert = require('node:assert/strict');
function expectedCatalogTotal(catalog) {
  const byCountry = catalog.destinationsByCountry;
  const registry = Object.values(byCountry).reduce((sum, profiles) => sum + profiles.length, 0);
  const ids = new Set(Object.values(byCountry).flatMap(profiles => profiles.map(profile => profile.id)));
  assert.equal(ids.size, registry, 'una ficha aparece en dos países del registro');
  return registry;
}
function expectedCountryCount(catalog) {
  return Object.values(catalog.destinationsByCountry).filter(profiles => profiles.length > 0).length;
}
module.exports = { expectedCatalogTotal, expectedCountryCount };
