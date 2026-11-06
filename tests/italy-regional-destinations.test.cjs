const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-italy-regional-catalog.json');
const provider = require('./fixtures/italy-regional-airport-provider.json');
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
const ibs = load('lib/destinations/italy-regional.ts').italyRegionalDestinations;
const airports = load('lib/travelpayouts/italy-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ["genoa", "trieste", "perugia-umbria", "ancona-marche", "rimini", "pescara-abruzzo", "bari-puglia", "brindisi-salento", "lamezia-calabria", "reggio-calabria", "ragusa-modica", "trapani-erice", "lampedusa", "pantelleria", "olbia-costa-smeralda", "alghero", "bolzano-dolomites", "crotone-capo-rizzuto", "foggia-gargano", "elba", "salerno-amalfi-coast", "parma", "forli-romagna", "cuneo-langhe"];
const codes = {"genoa": "GOA", "trieste": "TRS", "perugia-umbria": "PEG", "ancona-marche": "AOI", "rimini": "RMI", "pescara-abruzzo": "PSR", "bari-puglia": "BRI", "brindisi-salento": "BDS", "lamezia-calabria": "SUF", "reggio-calabria": "REG", "ragusa-modica": "CIY", "trapani-erice": "TPS", "lampedusa": "LMP", "pantelleria": "PNL", "olbia-costa-smeralda": "OLB", "alghero": "AHO", "bolzano-dolomites": "BZO", "crotone-capo-rizzuto": "CRV", "foggia-gargano": "FOG", "elba": "EBA", "salerno-amalfi-coast": "QSR", "parma": "PMF", "forli-romagna": "FRL", "cuneo-langhe": "CUF"};

test('Italy airport gaps add 24 draft IT profiles to 330 unchanged profiles; original cards, the 12 existing IT profiles and editorial pages stay intact', () => {
  assert.equal(before.profiles.length,330);
  assert.deepEqual(Array.from(ibs,p=>p.slug),slugs);
  assert.equal(catalog.destinationProfiles.length,386);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,386);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,386);
  for (const previous of before.profiles) assert.equal(digest(catalog.getDestinationById(previous.id)),previous.sha256,previous.id);
  assert.equal(catalog.getDestinationsByCountry('IT').length,36);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
  assert.equal(load('lib/destinations/featured.ts').destinations.length,16);
  for (const [season,hash] of Object.entries(before.seasons))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas',season,'page.tsx'),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const [file,hash] of Object.entries(before.monthPages))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/viajes-baratos/[mes]',file),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const profile of ibs) {
    assert.equal(profile.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile),false);
    assert.equal(profile.countryCode,'IT');
    assert.equal(profile.country,'Italia');
    assert.equal(profile.id,'it-'+profile.slug);
    assert.deepEqual(Array.from(profile.airports,a=>a.iataCode),[codes[profile.slug]]);
  }
});
for (const locale of locales) test(locale+': complete tourism content and unique lookup for the Italian airport-gap profiles', () => {
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
test('airports match the provider inventory, resolve to one profile each, and every Italian provider airport now has a profile except the documented pending ones', () => {
  const known = new Map(provider.airports.map(a=>[a.code,a]));
  for (const profile of ibs) {
    const code = profile.airports[0].iataCode, record = known.get(code);
    assert.ok(record && record.flightable && record.country_code==='IT',code);
    assert.equal(catalog.findDestinationProfile({iataCode:code}).id,profile.id);
    assert.ok(airports.italyPassengerAirports.some(a=>a.code===code),code+' in verified Italian helper');
  }
  const covered=new Set(catalog.destinationProfiles.filter(p=>p.countryCode==='IT').flatMap(p=>[...p.iataCodes,...p.airports.map(a=>a.iataCode),...(p.accessAirports||[]).map(a=>a.iataCode)]));
  for (const airport of airports.italyPassengerAirports) assert.ok(covered.has(airport.code),airport.code);
  for (const pending of provider.pendingVerification) {
    assert.equal(catalog.findDestinationProfile({iataCode:pending.code}),undefined,pending.code);
    assert.ok(!airports.italyPassengerAirports.some(a=>a.code===pending.code),pending.code);
  }
  assert.equal(catalog.findDestinationProfile({iataCode:'AHO'}).slug,'alghero');
  assert.equal(catalog.findDestinationProfile({iataCode:'EBA'}).slug,'elba');
});
test('selection from autocomplete resolves profiles only for the matching country', () => {
  const pick=(name,country,code)=>selection.destinationFromPlaceSelection({type:'airport',name,country,code,cityName:name,cityCode:code});
  assert.equal(pick('Génova','Italia','GOA').id,'it-genoa');
  assert.equal(pick('Alguer','Italia','AHO').id,'it-alghero');
  assert.equal(pick('Génova','España','GOA'),undefined);
});
test('every photo is a licensed Commons thumbnail with documented origin', () => {
  const photos = JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/italy-regional-photos.json'),'utf8'));
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
