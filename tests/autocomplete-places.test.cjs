const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
// Public, token-free provider responses captured on 2026-10-20; only ranking fields retained.
const samples = require('./fixtures/autocomplete-places.json');
const source = fs.readFileSync(path.join(__dirname, '../app/api/travelpayouts/places/route.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function endpoint(payload, options = {}) {
  const calls = [], exports = {};
  vm.runInNewContext(compiled, {
    exports, URL, Response, Intl, AbortSignal,
    require: id => {
      if(id === '@/lib/travelpayouts/italy-airports') return {italyPassengerAirports:[]};
      if(id === '@/lib/travelpayouts/uk-airports') return {ukAirportsForTerm:()=>[],ukUnavailablePassengerCodes:[]};
      if(id === '@/lib/travelpayouts/belgium-airports') return {belgiumAirportsForTerm:()=>[],belgiumAirports:[],belgiumCityAliases:{}};
      if(id === '@/lib/travelpayouts/switzerland-airports') return {switzerlandAirportsForTerm:()=>[],switzerlandTouristPlacesForTerm:()=>[],switzerlandAirports:[],switzerlandCityAliases:{}};
      if(id === '@/lib/travelpayouts/austria-airports') return {austriaAirportsForTerm:()=>[],austriaTouristPlacesForTerm:()=>[],austriaAirports:[],austriaCityAliases:{}};
      if(id === '@/lib/travelpayouts/poland-airports') return {polandAirportsForTerm:()=>[],polandTouristPlacesForTerm:()=>[],polandAirports:[],polandCityAliases:{}};
      if(id === '@/lib/travelpayouts/hungary-airports') return {hungaryAirportsForTerm:()=>[],hungaryTouristPlacesForTerm:()=>[],hungaryAirports:[],hungaryCityAliases:{}};
      if(id === '@/lib/travelpayouts/czechia-airports') return {czechiaAirportsForTerm:()=>[],czechiaTouristPlacesForTerm:()=>[],czechiaAirports:[],czechiaCityAliases:{}};
      if(id === '@/lib/travelpayouts/netherlands-airports') return {isNetherlandsCountryTerm:()=>false,netherlandsAirportsForTerm:()=>[],netherlandsCityAliases:{},netherlandsPassengerAirports:[],netherlandsUnavailablePassengerCodes:[]};
      if(id === '@/lib/travelpayouts/germany-airports') return {germanyAirportsForTerm:()=>[],germanyCityAliases:{},germanyPassengerAirports:[],germanyUnavailablePassengerCodes:[]};
      throw Error(id);
    },
    fetch: async (url, init) => {
      calls.push({ url: new URL(url), init });
      if (options.fail) throw Error('Provider unavailable');
      return { ok: options.ok !== false, json: async () => payload };
    },
  });
  return { calls, async search(term) {
    const url = new URL('https://example.test/api/travelpayouts/places');
    if (term !== undefined) url.searchParams.set('term', term);
    const response = await exports.GET(new Request(url));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    return (await response.json()).suggestions;
  } };
}

for (const [term, expected] of Object.entries({ lyon:'LYS', marsella:'MRS', paris:'PAR', LYS:'LYS', CDG:'CDG', ORY:'ORY', BVA:'BVA', MRS:'MRS' })) {
  test(`${term}: recorded provider results put the exact name/IATA first, ahead of popularity`, async () => {
    const { search } = endpoint(samples[term]);
    const results = await search(term);
    assert.equal(results[0].code, expected);
    assert.equal(results[0].country, 'Francia');
    assert.ok(results.length <= 6);
    assert.equal(new Set(results.map(p => `${p.country}:${p.type}:${p.code}`)).size, results.length);
    if (['CDG','ORY','BVA'].includes(term)) {
      assert.equal(results[0].type, 'airport');
      assert.equal(results[0].cityName, 'París');
      assert.equal(results[0].cityCode, 'PAR');
    }
    if (term === 'lyon') assert.equal(results[0].name, 'Lyon');
    if (term === 'paris') {
      for (const code of ['CDG','ORY','BVA']) assert.ok(results.some(p => p.code === code));
    }
  });
}

test('exact, prefix, word and substring matches precede unrelated popular places in every country', async () => {
  for (const [term, name, country] of [['york','York','GB'], ['osaka','Osaka','JP'], ['berlin','Berlín','DE'], ['sao paulo','São Paulo','BR']]) {
    const places = [
      {type:'city',name:'Palma de Mallorca',code:'PMI',country_code:'ES',weight:999999},
      {type:'city',name:`X${name}`,code:'CCC',country_code:country,weight:1000},
      {type:'city',name:`Nueva ${name}`,code:'BBB',country_code:country,weight:100},
      {type:'city',name:`${name} Norte`,code:'AAA',country_code:country,weight:10},
      {type:'city',name,code:'ZZZ',country_code:country,weight:1},
    ];
    const results = await endpoint(places).search(term);
    assert.deepEqual(results.map(p => p.code), ['ZZZ','AAA','BBB','CCC','PMI']);
  }
});

test('normalization handles case, accents and repeated whitespace without altering labels or codes', async () => {
  const api = endpoint([
    {type:'city',name:'Nueva York Norte',code:'EWR',country_code:'US',weight:100},
    {type:'city',name:'Nueva York',code:'NYC',country_code:'US',weight:1},
  ]);
  assert.equal((await api.search('  NuÉvA   YoRk  '))[0].name, 'Nueva York');
  assert.equal(api.calls[0].url.searchParams.get('term'), 'NuÉvA YoRk');
  assert.equal((await endpoint(samples.paris).search('  PÁRÍS  '))[0].code, 'PAR');
  assert.equal((await endpoint(samples.CDG).search('  cdg  '))[0].code, 'CDG');
});

test('an exact airport name or physical IATA beats popular cities and associated city codes', async () => {
  const places = [
    {type:'city',name:'Charles de Gaulle Nord',code:'AAA',country_code:'FR',weight:999999},
    {type:'airport',name:'Charles de Gaulle',code:'CDG',city_name:'París',city_code:'PAR',country_code:'FR',weight:1},
    {type:'airport',name:'Other airport',code:'BBB',city_name:'Other city',city_code:'CDG',country_code:'FR',weight:999999},
  ];
  assert.equal((await endpoint(places).search('charles de gaulle'))[0].code, 'CDG');
  assert.equal((await endpoint(places).search('cdg'))[0].code, 'CDG');
});

test('provider aliases remain searchable but do not displace an exact display-name match', async () => {
  const results = await endpoint([
    {type:'city',name:'München',code:'MUC',country_code:'DE',index_strings:['Munich'],weight:20},
    {type:'city',name:'Munich',code:'AAA',country_code:'US',weight:1},
    {type:'city',name:'Munich West',code:'BBB',country_code:'US',weight:9999},
  ]).search('munich');
  assert.deepEqual(results.map(p=>p.code), ['AAA','MUC','BBB']);
});

test('deduplication preserves the best matching record, distinct countries, and distinct Paris airports', async () => {
  const results = await endpoint([
    {type:'city',name:'Different label',code:'LYS',country_code:'FR',weight:999999},
    {type:'city',name:'Lyon',code:' lys ',country_code:' fr ',weight:1},
    {type:'city',name:'Lyon',code:'LYS',country_code:'US',weight:2},
    ...samples.paris.slice(0,4),
  ]).search('lyon');
  assert.equal(results.filter(p=>p.country==='Francia' && p.code==='LYS').length,1);
  assert.equal(results.find(p=>p.country==='Francia' && p.code==='LYS').name,'Lyon');
  assert.ok(results.some(p=>p.country==='Estados Unidos' && p.code==='LYS'));
  for (const code of ['PAR','CDG','ORY','BVA']) assert.ok(results.some(p=>p.code===code));
});

test('popularity and the existing city preference break equal relevance ties; stable ties keep provider order', async () => {
  const results = await endpoint([
    {type:'city',name:'York North',code:'AAA',country_code:'GB',weight:1},
    {type:'city',name:'York East',code:'BBB',country_code:'GB',weight:20},
    {type:'city',name:'York West',code:'CCC',country_code:'GB',weight:20},
    {type:'airport',name:'York Airport',code:'DDD',country_code:'GB',weight:999999},
  ]).search('york');
  assert.deepEqual(results.map(p=>p.code), ['BBB','CCC','AAA','DDD']);
});

test('invalid input avoids the provider; errors/malformed payloads retain the safe empty response', async () => {
  const api=endpoint([]);
  for (const term of [undefined,'',' ','a','a'.repeat(101)]) assert.deepEqual(await api.search(term),[]);
  assert.equal(api.calls.length,0);
  for (const options of [{fail:true},{ok:false},{}]) assert.deepEqual(await endpoint({},options).search('lyon'),[]);
  const results=await endpoint([null,[],1,{type:'country',name:'France'},{type:'city',name:' '}, {type:'city',name:'Lyon',code:'invalid',country_code:'?',country_name:'Francia',weight:NaN}]).search('lyon');
  assert.equal(results.length,1);assert.equal(results[0].code,null);assert.equal(results[0].country,'Francia');
});

test('only the public autocomplete is queried, with the existing locale, types, timeout and no credentials', async () => {
  const api=endpoint(samples.lyon);
  await api.search('lyon');
  assert.equal(api.calls.length,1);
  const {url,init}=api.calls[0];
  assert.equal(url.origin+url.pathname,'https://autocomplete.travelpayouts.com/places2');
  assert.equal(url.searchParams.get('locale'),'es');
  assert.deepEqual(url.searchParams.getAll('types[]'),['city','airport']);
  assert.equal(init.cache,'no-store');assert.ok(init.signal instanceof AbortSignal);
  assert.equal(init.headers,undefined);
  assert.deepEqual([...url.searchParams.keys()].sort(),['locale','term','types[]','types[]']);
});
