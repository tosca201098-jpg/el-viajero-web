const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-southeast-europe-catalog.json');
const provider = require('./fixtures/southeast-europe-airport-provider.json');
const locales = ['es','en','fr','de','it','pt','ca'];
const digest = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
function loader(globals = {}) {
  const cache = new Map();
  function load(file) {
    file = file.replaceAll('\\','/');
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(code, { exports, Intl, URL, URLSearchParams, Request, Response, AbortSignal, ...globals,
      require: id => {
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file),id);
        const next = [base+'.ts',path.join(base,'index.ts')].find(p => fs.existsSync(path.join(root,p)));
        if (!next) throw Error(id);
        return load(next);
      } }, { filename: file });
    return exports;
  }
  return load;
}
const load = loader();
const catalog = load('lib/destinations/index.ts');
const sees = load('lib/destinations/southeast-europe.ts').southeastEuropeDestinations;
const airports = load('lib/travelpayouts/southeast-europe-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ['belgrade','nis','sarajevo','mostar','tuzla','banja-luka','podgorica','tivat','skopje','ohrid','pristina','malta','larnaca','paphos'];
const country = { belgrade:'RS', nis:'RS', sarajevo:'BA', mostar:'BA', tuzla:'BA', 'banja-luka':'BA', podgorica:'ME', tivat:'ME', skopje:'MK', ohrid:'MK', pristina:'XK', malta:'MT', larnaca:'CY', paphos:'CY' };
const codes = { belgrade:'BEG', nis:'INI', sarajevo:'SJJ', mostar:'OMO', tuzla:'TZL', 'banja-luka':'BNX', podgorica:'TGD', tivat:'TIV', skopje:'SKP', ohrid:'OHD', pristina:'PRN', malta:'MLA', larnaca:'LCA', paphos:'PFO' };
const spanish = { RS:'Serbia', BA:'Bosnia y Herzegovina', ME:'Montenegro', MK:'Macedonia del Norte', XK:'Kosovo', MT:'Malta', CY:'Chipre' };

test('south-eastern Europe adds 14 draft profiles to 233 unchanged profiles; original cards and editorial pages stay intact', () => {
  assert.equal(before.profiles.length,233);
  assert.deepEqual(Array.from(sees,p=>p.slug),slugs);
  assert.equal(catalog.destinationProfiles.length,393);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,393);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,393);
  for (const previous of before.profiles) assert.equal(digest(catalog.getDestinationById(previous.id)),previous.sha256,previous.id);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
  assert.equal(load('lib/destinations/featured.ts').destinations.length,16);
  for (const [season,hash] of Object.entries(before.seasons))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas',season,'page.tsx'),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const [file,hash] of Object.entries(before.monthPages))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/viajes-baratos/[mes]',file),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const code of Object.keys(spanish)) assert.ok(catalog.getDestinationsByCountry(code).length>=1,code);
  for (const profile of sees) {
    assert.equal(profile.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile),false);
    assert.equal(profile.countryCode,country[profile.slug]);
    assert.equal(profile.country,spanish[profile.countryCode]);
    assert.deepEqual(Array.from(profile.airports,a=>a.iataCode),[codes[profile.slug]]);
  }
});
for (const locale of locales) test(locale+': complete tourism content and lookup for south-eastern Europe', () => {
  for (const profile of sees) {
    const copy=profile.translations[locale];
    assert.ok(copy.name && copy.description && copy.recommendedStay && copy.seasonalityNote);
    assert.equal(copy.recommendations.length,4);
    assert.equal(new Set(copy.recommendations).size,4);
    assert.ok(copy.recommendations.every(Boolean));
    assert.equal(catalog.findDestinationProfile({name:copy.name}),profile,profile.slug+' '+copy.name);
    for (const key of ['bestMonths','lowSeasonMonths','highSeasonMonths'])
      assert.ok(profile[key].length && profile[key].every(m=>Number.isInteger(m)&&m>=1&&m<=12));
    assert.ok(!profile.highSeasonMonths.some(m=>profile.lowSeasonMonths.includes(m)),profile.slug);
  }
});
test('airports match the provider inventory, resolve to one profile each and exclude Kraljevo', () => {
  const known = new Map(provider.airports.map(a=>[a.code,a]));
  for (const profile of sees) {
    const code = profile.airports[0].iataCode, record = known.get(code);
    assert.ok(record && record.flightable && record.country_code===profile.countryCode,code);
    assert.equal(catalog.findDestinationProfile({iataCode:code}).id,profile.id);
  }
  assert.deepEqual(Array.from(airports.southeastEuropeAirports,a=>a.code).sort(),Object.values(codes).sort());
  assert.equal(airports.southeastEuropeAirportsForTerm('KVO').length,0);
  assert.equal(provider.pendingVerification[0].code,'KVO');
  assert.equal(airports.southeastEuropeAirportsForTerm('Kotor')[0].code,'TIV');
  assert.equal(airports.southeastEuropeAirportsForTerm('Skopie')[0].code,'SKP');
  assert.equal(airports.southeastEuropeTouristPlacesForTerm('bel')[0].code,'BEG');
  assert.equal(airports.southeastEuropeAirportTown('OHD','it'),'Ocrida');
  assert.equal(airports.southeastEuropeAirportTown('MLA','fr'),'Malte');
});
test('selection from autocomplete resolves profiles only for the matching country', () => {
  const pick=(name,country,code)=>selection.destinationFromPlaceSelection({type:'airport',name,country,code,cityName:name,cityCode:code});
  assert.equal(pick('Belgrado','Serbia','BEG').id,'rs-belgrade');
  assert.equal(pick('Pafos','Chipre','PFO').id,'cy-paphos');
  assert.equal(pick('Pristina','Kosovo','PRN').id,'xk-pristina');
  assert.equal(pick('Belgrado','España','BEG'),undefined);
});
test('every photo is a licensed Commons thumbnail with documented origin', () => {
  const photos = JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/southeast-europe-photos.json'),'utf8'));
  for (const p of sees) {
    assert.match(p.image,/^https:\/\/thumb\.wikimedia\.org\/wikipedia\/commons\/thumb\/[0-9a-f]\/[0-9a-f]{2}\//);
    assert.match(p.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(p.imageLicense,/^CC BY(-SA)? [234]\.[05]$/);
    for (const key of ['imageCredit','imageLicenseUrl']) assert.ok(p[key],key);
    assert.equal(photos[p.slug].license,p.imageLicense);
    assert.equal(photos[p.slug].author,p.imageCredit);
    assert.ok(p.image.includes('/'+crypto.createHash('md5').update(decodeURIComponent(p.imageSource.split('File:')[1])).digest('hex').slice(0,2)+'/'));
  }
  assert.equal(new Set(sees.map(p=>p.image)).size,sees.length);
});
