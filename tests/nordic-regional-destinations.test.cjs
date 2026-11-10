const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-nordic-regional-catalog.json');
const provider = require('./fixtures/nordic-regional-airport-provider.json');
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
const ibs = load('lib/destinations/nordic-regional.ts').nordicRegionalDestinations;
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ["sandefjord-vestfold", "joensuu-karelia", "jyvaskyla", "kajaani-kainuu", "kemi-tornio", "kokkola-jakobstad", "pori", "savonlinna", "egilsstadir-east-iceland", "isafjordur-westfjords"];
const codes = {"sandefjord-vestfold": "TRF", "joensuu-karelia": "JOE", "jyvaskyla": "JYV", "kajaani-kainuu": "KAJ", "kemi-tornio": "KEM", "kokkola-jakobstad": "KOK", "pori": "POR", "savonlinna": "SVL", "egilsstadir-east-iceland": "EGS", "isafjordur-westfjords": "IFJ"};
const countries = {NO: 'Noruega', FI: 'Finlandia', IS: 'Islandia'};
const expected = {NO: 21, FI: 15, IS: 4};

test('Nordic regional gaps add 10 draft profiles (NO, FI, IS) to 376 unchanged profiles; original cards, existing profiles and editorial pages stay intact', () => {
  assert.equal(before.profiles.length,376);
  assert.deepEqual(Array.from(ibs,p=>p.slug),slugs);
  assert.equal(catalog.destinationProfiles.length,474);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,474);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,474);
  for (const previous of before.profiles) assert.equal(digest(catalog.getDestinationById(previous.id)),previous.sha256,previous.id);
  for (const [cc,n] of Object.entries(expected)) assert.equal(catalog.getDestinationsByCountry(cc).length,n,cc);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
  assert.equal(load('lib/destinations/featured.ts').destinations.length,16);
  for (const [season,hash] of Object.entries(before.seasons))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas',season,'page.tsx'),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const [file,hash] of Object.entries(before.monthPages))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/viajes-baratos/[mes]',file),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const profile of ibs) {
    assert.equal(profile.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile),false);
    assert.ok(countries[profile.countryCode]);
    assert.equal(profile.country,countries[profile.countryCode]);
    assert.equal(profile.id,profile.countryCode.toLowerCase()+'-'+profile.slug);
    assert.deepEqual(Array.from(profile.airports,a=>a.iataCode),[codes[profile.slug]]);
  }
});
for (const locale of locales) test(locale+': complete tourism content and unique lookup for the Nordic regional airport-gap profiles', () => {
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
test('airports match the provider inventory and resolve to one profile each; pending airports stay without a profile', () => {
  const known = new Map(provider.airports.map(a=>[a.code,a]));
  for (const profile of ibs) {
    const code = profile.airports[0].iataCode, record = known.get(code);
    assert.ok(record && record.flightable && record.country_code===profile.countryCode,code);
    assert.ok(provider.serviceEvidence[code],code+' has documented service evidence');
    assert.equal(catalog.findDestinationProfile({iataCode:code}).id,profile.id);
  }
  for (const pending of provider.pendingVerification)
    assert.equal(catalog.findDestinationProfile({iataCode:pending.code}),undefined,pending.code);
  assert.equal(catalog.findDestinationProfile({iataCode:'TRF'}).slug,'sandefjord-vestfold');
  assert.equal(catalog.findDestinationProfile({iataCode:'KEM'}).slug,'kemi-tornio');
});
test('selection from autocomplete resolves profiles only for the matching country', () => {
  const pick=(name,country,code)=>selection.destinationFromPlaceSelection({type:'airport',name,country,code,cityName:name,cityCode:code});
  assert.equal(pick('Pori','Finlandia','POR').id,'fi-pori');
  assert.equal(pick('Ísafjörður','Islandia','IFJ').id,'is-isafjordur-westfjords');
  assert.equal(pick('Savonlinna','Finlandia','SVL').id,'fi-savonlinna');
  assert.equal(pick('Pori','España','POR'),undefined);
});
test('every photo is a licensed Commons thumbnail with documented origin', () => {
  const photos = JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/nordic-regional-photos.json'),'utf8'));
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
