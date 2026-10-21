const assert = require('node:assert/strict');

// Keep the historical catalog digests intact. Only the explicitly approved
// Asturias image replacement is normalized before comparing tourism data.
exports.withHistoricalImage = function withHistoricalImage(destination) {
  if (destination.id !== 'es-asturias') return destination;
  assert.equal(destination.image, '/images/destinations/asturias.webp');
  for (const field of ['imageSource', 'imageCredit', 'imageLicense', 'imageLicenseUrl']) {
    assert.equal(destination[field], undefined, `Asturias: stale ${field}`);
  }
  return {
    ...destination,
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Lagos_de_Covadonga.jpg/960px-Lagos_de_Covadonga.jpg',
    imageSource: 'https://commons.wikimedia.org/wiki/File:Lagos_de_Covadonga.jpg',
    imageCredit: 'JavierOlivares',
    imageLicense: 'CC BY-SA 4.0',
    imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  };
};
