const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-nordics-catalog.json');
const provider = require('./fixtures/nordics-airport-provider.json');
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
const nds = load('lib/destinations/nordics.ts').nordicsDestinations;
const airports = load('lib/travelpayouts/nordics-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ['copenhagen','aarhus','billund','aalborg','bornholm','reykjavik','akureyri','helsinki','rovaniemi','turku','tampere','oulu','levi','ivalo','kuusamo'];
const country = { copenhagen:'DK',aarhus:'DK',billund:'DK',aalborg:'DK',bornholm:'DK',reykjavik:'IS',akureyri:'IS',helsinki:'FI',rovaniemi:'FI',turku:'FI',tampere:'FI',oulu:'FI',levi:'FI',ivalo:'FI',kuusamo:'FI' };
const codes = { copenhagen:'CPH',aarhus:'AAR',billund:'BLL',aalborg:'AAL',bornholm:'RNN',reykjavik:'KEF',akureyri:'AEY',helsinki:'HEL',rovaniemi:'RVN',turku:'TKU',tampere:'TMP',oulu:'OUL',levi:'KTT',ivalo:'IVL',kuusamo:'KAO' };
const spanish = { DK:'Dinamarca', IS:'Islandia', FI:'Finlandia' };

test('Denmark, Iceland and Finland adds 15 draft profiles to 262 unchanged profiles; original cards and editorial pages stay intact', () => {
  assert.equal(before.profiles.length,262);
  assert.deepEqual(Array.from(nds,p=>p.slug),slugs);
  assert.equal(catalog.destinationProfiles.length,293);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,293);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,293);
  for (const previous of before.profiles) assert.equal(digest(catalog.getDestinationById(previous.id)),previous.sha256,previous.id);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
  assert.equal(load('lib/destinations/featured.ts').destinations.length,16);
  for (const [season,hash] of Object.entries(before.seasons))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas',season,'page.tsx'),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const [file,hash] of Object.entries(before.monthPages))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/viajes-baratos/[mes]',file),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const code of Object.keys(spanish)) assert.ok(catalog.getDestinationsByCountry(code).length>=1,code);
  for (const profile of nds) {
    assert.equal(profile.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile),false);
    assert.equal(profile.countryCode,country[profile.slug]);
    assert.equal(profile.country,spanish[profile.countryCode]);
    assert.deepEqual(Array.from(profile.airports,a=>a.iataCode),[codes[profile.slug]]);
  }
});
for (const locale of locales) test(locale+': complete tourism content and lookup for Denmark, Iceland and Finland', () => {
  for (const profile of nds) {
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
  for (const profile of nds) {
    const code = profile.airports[0].iataCode, record = known.get(code);
    assert.ok(record && record.flightable && record.country_code===profile.countryCode,code);
    assert.equal(catalog.findDestinationProfile({iataCode:code}).id,profile.id);
  }
  assert.deepEqual(Array.from(airports.nordicsAirports,a=>a.code).sort(),Object.values(codes).sort());
  assert.equal(airports.nordicsAirportsForTerm('EBJ').length,0);
  assert.ok(provider.pendingVerification.some(a=>a.code==='EBJ'));
  assert.equal(airports.nordicsAirportsForTerm('Keflavik')[0].code,'KEF');
  assert.equal(airports.nordicsAirportsForTerm('Kittilä')[0].code,'KTT');
  assert.equal(airports.nordicsTouristPlacesForTerm('cop')[0].code,'CPH');
  assert.equal(airports.nordicsAirportTown('KEF','en'),'Reykjavik');
});
test('selection from autocomplete resolves profiles only for the matching country', () => {
  const pick=(name,country,code)=>selection.destinationFromPlaceSelection({type:'airport',name,country,code,cityName:name,cityCode:code});
  assert.equal(pick('Copenhague','Dinamarca','CPH').id,'dk-copenhagen');
  assert.equal(pick('Reikiavik','Islandia','KEF').id,'is-reykjavik');
  assert.equal(pick('Helsinki','Finlandia','HEL').id,'fi-helsinki');
  assert.equal(pick('Helsinki','España','HEL'),undefined);
});
test('every photo is a licensed Commons thumbnail with documented origin', () => {
  const photos = JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/nordics-photos.json'),'utf8'));
  for (const p of nds) {
    assert.match(p.image,/^https:\/\/thumb\.wikimedia\.org\/wikipedia\/commons\/thumb\/[0-9a-f]\/[0-9a-f]{2}\//);
    assert.match(p.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(p.imageLicense,/^(CC0|CC BY(-SA)? [234]\.[05])$/);
    for (const key of ['imageCredit','imageLicenseUrl']) assert.ok(p[key],key);
    assert.equal(photos[p.slug].license,p.imageLicense);
    assert.equal(photos[p.slug].author,p.imageCredit);
    assert.ok(p.image.includes('/'+crypto.createHash('md5').update(decodeURIComponent(p.imageSource.split('File:')[1])).digest('hex').slice(0,2)+'/'));
  }
  assert.equal(new Set(nds.map(p=>p.image)).size,nds.length);
});
