const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-turkey-catalog.json');
const provider = require('./fixtures/turkey-airport-provider.json');
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
const turkish = load('lib/destinations/turkey.ts').turkeyDestinations;
const airports = load('lib/travelpayouts/turkey-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ['istanbul','ankara','izmir','antalya','bodrum','dalaman','trabzon','cappadocia','gaziantep','konya','alanya','adana','bursa','samsun','sanliurfa','mardin','van','erzurum','diyarbakir','kars','canakkale','pamukkale','rize'];
const codes = { istanbul:['IST','SAW'], ankara:['ESB'], izmir:['ADB'], antalya:['AYT'], bodrum:['BJV'], dalaman:['DLM'], trabzon:['TZX'], cappadocia:['NAV'], gaziantep:['GZT'], konya:['KYA'], alanya:['GZP'], adana:['COV'], bursa:['YEI'], samsun:['SZF'], sanliurfa:['GNY'], mardin:['MQM'], van:['VAN'], erzurum:['ERZ'], diyarbakir:['DIY'], kars:['KSY'], canakkale:['CKZ'], pamukkale:['DNZ'], rize:['RZV'] };

test('Turkey adds 23 draft profiles to 210 unchanged profiles; original cards and editorial pages stay intact', () => {
  assert.equal(before.profiles.length,210);
  assert.deepEqual(Array.from(turkish,p=>p.slug),slugs);
  assert.equal(catalog.destinationProfiles.length,386);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,386);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,386);
  for (const previous of before.profiles) {
    const profile = catalog.getDestinationById(previous.id);
    assert.equal(digest(profile),previous.sha256,previous.id);
  }
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
  assert.equal(load('lib/destinations/featured.ts').destinations.length,16);
  for (const [season,hash] of Object.entries(before.seasons))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas',season,'page.tsx'),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const [file,hash] of Object.entries(before.monthPages))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/viajes-baratos/[mes]',file),'utf8').replace(/\r\n/g,'\n')),hash);
  assert.equal(catalog.getDestinationsByCountry('TR').length,23);
  for (const profile of turkish) {
    assert.equal(profile.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile),false);
    assert.equal(profile.country,'Turquía');
  }
});
for (const locale of locales) test(locale+': complete Turkish tourism content and lookup', () => {
  for (const profile of turkish) {
    const copy=profile.translations[locale];
    assert.ok(copy.name && copy.description && copy.recommendedStay && copy.seasonalityNote);
    assert.equal(copy.recommendations.length,4);
    assert.equal(new Set(copy.recommendations).size,4);
    assert.ok(copy.recommendations.every(Boolean));
    assert.equal(catalog.findDestinationProfile({name:copy.name}),profile,profile.slug+' '+copy.name);
    assert.equal(profile.countryCode,'TR');
    for (const key of ['bestMonths','lowSeasonMonths','highSeasonMonths'])
      assert.ok(profile[key].length && profile[key].every(m=>Number.isInteger(m)&&m>=1&&m<=12));
  }
});
test('physical airports match the provider inventory and resolve to one profile each', () => {
  const known = new Map(provider.airports.map(a=>[a.code,a]));
  for (const profile of turkish) {
    assert.deepEqual(Array.from(profile.airports,a=>a.iataCode),codes[profile.slug]);
    for (const { iataCode } of profile.airports) {
      const record = known.get(iataCode);
      assert.ok(record && record.flightable && record.country_code==='TR',iataCode);
      assert.equal(catalog.findDestinationProfile({iataCode}).id,profile.id);
    }
  }
  assert.deepEqual(Array.from(airports.turkeyAirports,a=>a.code).sort(),['ADB','AYT','BJV','CKZ','COV','DIY','DLM','DNZ','ERZ','ESB','GNY','GZP','GZT','IST','KSY','KYA','MQM','NAV','RZV','SAW','SZF','TZX','VAN','YEI']);
  assert.equal(catalog.findDestinationProfile({iataCode:'ANK'}).id,'tr-ankara');
  assert.equal(catalog.findDestinationProfile({iataCode:'IZM'}).id,'tr-izmir');
  assert.equal(catalog.findDestinationProfile({iataCode:'ASR'}).id,'tr-cappadocia');
  const capp = catalog.getDestinationById('tr-cappadocia');
  assert.deepEqual(Array.from(capp.accessAirports,a=>a.iataCode),['ASR']);
  assert.ok(!capp.airports.some(a=>a.iataCode==='ASR'));
  for (const code of ['ISL']) assert.equal(airports.turkeyAirportsForTerm(code).length,0);
  assert.equal(airports.turkeyAirportsForTerm('Sabiha Gökçen')[0].code,'SAW');
  assert.equal(airports.turkeyAirportsForTerm('SAW')[0].city_code,'IST');
  assert.equal(airports.turkeyAirportsForTerm('Kapadokya')[0].code,'NAV');
  assert.equal(airports.turkeyTouristPlacesForTerm('esm')[0].code,'ADB');
  assert.equal(airports.turkeyAirportTown('SAW','de'),'Istanbul');
  assert.equal(airports.turkeyAirportTown('NAV','fr'),'Cappadoce');
});
test('selection from autocomplete resolves Turkish profiles', () => {
  const pick=(type,name,code,cityName,cityCode)=>selection.destinationFromPlaceSelection({type,name,country:'Turquía',code,cityName,cityCode});
  assert.equal(pick('airport','Sabiha Gökçen','SAW','Estambul','IST').id,'tr-istanbul');
  assert.equal(pick('city','Esmirna','ADB','Esmirna','ADB').id,'tr-izmir');
  assert.equal(pick('airport','Dalaman','DLM','Dalaman','DLM').id,'tr-dalaman');
  assert.equal(selection.destinationFromPlaceSelection({type:'airport',name:'Dalaman',country:'España',code:'DLM',cityName:'Dalaman',cityCode:'DLM'}),undefined);
});
test('every Turkish photo is a licensed Commons thumbnail with documented origin', () => {
  const photos = JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/turkey-photos.json'),'utf8'));
  for (const p of turkish) {
    assert.match(p.image,/^https:\/\/thumb\.wikimedia\.org\/wikipedia\/commons\/thumb\/[0-9a-f]\/[0-9a-f]{2}\//);
    assert.match(p.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(p.imageLicense,/^(CC BY(-SA)? [234]\.[05]( PL)?|CC0 1\.0)$/);
    for (const key of ['imageCredit','imageLicenseUrl']) assert.ok(p[key],key);
    assert.equal(photos[p.slug].license,p.imageLicense);
    assert.equal(photos[p.slug].author,p.imageCredit);
    assert.ok(p.image.includes(crypto.createHash('md5').update(decodeURIComponent(p.imageSource.split('File:')[1])).digest('hex').slice(0,2)));
  }
  assert.equal(new Set(turkish.map(p=>p.image)).size,turkish.length);
});
