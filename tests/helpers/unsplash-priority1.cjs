// Fotos de Unsplash elegidas por el propietario (prioridad 1): 29 fichas del catálogo ya no usan una foto de
// Wikimedia Commons. Las pruebas antiguas que exigían "foto de Commons" llaman a `checked(perfil)`: si la ficha es una de
// las 29, se comprueba su foto de Unsplash (dirección, página de origen, autor y licencia) en lugar de la de Commons y
// devuelve true para que la prueba salte la parte de Commons; en las demás fichas devuelve false y todo sigue igual.
const assert = require('node:assert/strict');
const photos = require('../fixtures/unsplash-priority1.json');

const byId = new Map(photos.catalog.map(photo => [photo.id, photo]));

function checked(profile) {
  const photo = byId.get(profile.id);
  if (!photo) return false;
  assert.equal(profile.image, photo.image, profile.id);
  assert.match(profile.image, /^https:\/\/images\.unsplash\.com\/photo-[0-9a-f]+-[0-9a-f]+\?auto=format&fit=crop&w=1600&q=80$/, profile.id);
  assert.equal(profile.imageSource, photo.imageSource, profile.id);
  assert.match(profile.imageSource, /^https:\/\/unsplash\.com\/photos\/[\w-]{11}$/, profile.id);
  assert.equal(profile.imageCredit, photo.author, profile.id);
  assert.ok(profile.imageCredit && !/<[^>]+>/.test(profile.imageCredit), profile.id);
  assert.equal(profile.imageLicense, 'Unsplash License', profile.id);
  assert.equal(profile.imageLicenseUrl, 'https://unsplash.com/license', profile.id);
  return true;
}

module.exports = { checked, ids: new Set(byId.keys()) };
