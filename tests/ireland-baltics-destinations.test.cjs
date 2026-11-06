const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-ireland-baltics-catalog.json');
const provider = require('./fixtures/ireland-baltics-airport-provider.json');
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
const ibs = load('lib/destinations/ireland-baltics.ts').irelandBalticsDestinations;
const airports = load('lib/travelpayouts/ireland-baltics-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ['dublin', 'cork', 'shannon', 'knock', 'kerry', 'tallinn', 'riga', 'vilnius', 'kaunas', 'palanga', 'luxembourg', 'gibraltar', 'jersey', 'guernsey', 'isle-of-man', 'faroe-islands', 'aland'];
const country = {'dublin': 'IE', 'cork': 'IE', 'shannon': 'IE', 'knock': 'IE', 'kerry': 'IE', 'tallinn': 'EE', 'riga': 'LV', 'vilnius': 'LT', 'kaunas': 'LT', 'palanga': 'LT', 'luxembourg': 'LU', 'gibraltar': 'GI', 'jersey': 'JE', 'guernsey': 'GG', 'isle-of-man': 'IM', 'faroe-islands': 'FO', 'aland': 'AX'};
const codes = {'dublin': 'DUB', 'cork': 'ORK', 'shannon': 'SNN', 'knock': 'NOC', 'kerry': 'KIR', 'tallinn': 'TLL', 'riga': 'RIX', 'vilnius': 'VNO', 'kaunas': 'KUN', 'palanga': 'PLQ', 'luxembourg': 'LUX', 'gibraltar': 'GIB', 'jersey': 'JER', 'guernsey': 'GCI', 'isle-of-man': 'IOM', 'faroe-islands': 'FAE', 'aland': 'MHQ'};
const spanish = { IE:'Irlanda', EE:'Estonia', LV:'Letonia', LT:'Lituania', LU:'Luxemburgo', GI:'Gibraltar', JE:'Jersey', GG:'Guernsey', IM:'Isla de Man', FO:'Islas Feroe', AX:'Islas Åland' };

test('Ireland, the Baltics, Luxembourg and territories adds 17 draft profiles to 293 unchanged profiles; original cards and editorial pages stay intact', () => {
  assert.equal(before.profiles.length,293);
  assert.deepEqual(Array.from(ibs,p=>p.slug),slugs);
  assert.equal(catalog.destinationProfiles.length,366);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,366);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,366);
  for (const previous of before.profiles) assert.equal(digest(catalog.getDestinationById(previous.id)),previous.sha256,previous.id);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
  assert.equal(load('lib/destinations/featured.ts').destinations.length,16);
  for (const [season,hash] of Object.entries(before.seasons))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas',season,'page.tsx'),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const [file,hash] of Object.entries(before.monthPages))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/viajes-baratos/[mes]',file),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const code of Object.keys(spanish)) assert.ok(catalog.getDestinationsByCountry(code).length>=1,code);
  for (const profile of ibs) {
    assert.equal(profile.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile),false);
    assert.equal(profile.countryCode,country[profile.slug]);
    assert.equal(profile.country,spanish[profile.countryCode]);
    assert.deepEqual(Array.from(profile.airports,a=>a.iataCode),[codes[profile.slug]]);
  }
});
for (const locale of locales) test(locale+': complete tourism content and lookup for Ireland, the Baltics, Luxembourg and territories', () => {
  for (const profile of ibs) {
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
test('airports match the provider inventory, resolve to one profile each and exclude pending airports', () => {
  const known = new Map(provider.airports.map(a=>[a.code,a]));
  for (const profile of ibs) {
    const code = profile.airports[0].iataCode, record = known.get(code);
    assert.ok(record && record.flightable && record.country_code===profile.countryCode,code);
    assert.equal(catalog.findDestinationProfile({iataCode:code}).id,profile.id);
  }
  assert.deepEqual(Array.from(airports.irelandBalticsAirports,a=>a.code).sort(),Object.values(codes).sort());
  assert.equal(airports.irelandBalticsAirportsForTerm('CFN').length,0);
  assert.ok(provider.pendingVerification.some(a=>a.code==='CFN'));
  assert.equal(airports.irelandBalticsAirportsForTerm('Findel')[0].code,'LUX');
  assert.equal(airports.irelandBalticsAirportsForTerm('Mariehamn')[0].code,'MHQ');
  assert.equal(airports.irelandBalticsTouristPlacesForTerm('dub')[0].code,'DUB');
  assert.equal(airports.irelandBalticsAirportTown('TLL','es'),'Tallin');
});
test('selection from autocomplete resolves profiles only for the matching country', () => {
  const pick=(name,country,code)=>selection.destinationFromPlaceSelection({type:'airport',name,country,code,cityName:name,cityCode:code});
  assert.equal(pick('Dublín','Irlanda','DUB').id,'ie-dublin');
  assert.equal(pick('Gibraltar','Gibraltar','GIB').id,'gi-gibraltar');
  assert.equal(pick('Islas Feroe','Islas Feroe','FAE').id,'fo-faroe-islands');
  assert.equal(pick('Dublín','España','DUB'),undefined);
});
test('every photo is a licensed Commons thumbnail with documented origin', () => {
  const photos = JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/ireland-baltics-photos.json'),'utf8'));
  for (const p of ibs) {
    assert.match(p.image,/^https:\/\/thumb\.wikimedia\.org\/wikipedia\/commons\/thumb\/[0-9a-f]\/[0-9a-f]{2}\//);
    assert.match(p.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(p.imageLicense,/^(CC0|CC BY(-SA)? [234]\.[05])$/);
    for (const key of ['imageCredit','imageLicenseUrl']) assert.ok(p[key],key);
    assert.equal(photos[p.slug].license,p.imageLicense);
    assert.equal(photos[p.slug].author,p.imageCredit);
    assert.ok(p.image.includes('/'+crypto.createHash('md5').update(decodeURIComponent(p.imageSource.split('File:')[1])).digest('hex').slice(0,2)+'/'));
  }
  assert.equal(new Set(ibs.map(p=>p.image)).size,ibs.length);
});
