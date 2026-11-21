// Las ofertas de Aviasales («Ver oferta») llevan un enlace de afiliado propio: la comisión no depende de que la persona
// acepte las cookies (antes la ponía el script «Drive», que ahora solo se carga con permiso).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loader } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const { affiliateOfferHref, AFFILIATE_PARAMS } = loader(root)('lib/travelpayouts/affiliate.ts');
const OFFER = 'https://www.aviasales.com/search/MAD1212PMI15121?expected_price=40&expected_price_currency=eur';

test('an Aviasales offer becomes an affiliate link in exactly the format Drive produced on the web', () => {
  const href = affiliateOfferHref(OFFER);
  assert.equal(href, 'https://emrldco.com/re?campaign_id=100&marker=790477&p=4114&trs=586025&u=' + encodeURIComponent(OFFER));
  const url = new URL(href);
  for (const [name, value] of Object.entries(AFFILIATE_PARAMS)) assert.equal(url.searchParams.get(name), value, name);
  assert.equal(url.searchParams.get('u'), OFFER, 'el enlace de Aviasales viaja intacto, con su precio esperado');
});

test('anything that is not an https Aviasales link is left exactly as it was', () => {
  for (const other of ['https://example.com/search/MAD1212PMI15121', 'http://www.aviasales.com/search/X', 'https://user:pw@www.aviasales.com/search/X',
    'https://www.aviasales.com.evil.test/search/X', 'no es un enlace', '', 'javascript:alert(1)']) {
    assert.equal(affiliateOfferHref(other), other, other);
  }
  const already = affiliateOfferHref(OFFER);
  assert.equal(affiliateOfferHref(already), already, 'un enlace que ya es de afiliado no se vuelve a envolver');
});

test('both places that show «Ver oferta» use it, and no script is needed to earn the commission', () => {
  for (const file of ['app/page.tsx', 'app/viajes-baratos/[mes]/MonthlyOffers.tsx']) {
    const source = read(file);
    assert.match(source, /import \{ affiliateOfferHref \} from "@\/lib\/travelpayouts\/affiliate";/, file);
    assert.match(source, /href=\{affiliateOfferHref\((flight|card)\.offerUrl\)\}/, file);
    assert.doesNotMatch(source, /href=\{(flight|card)\.offerUrl\}/, `${file}: ningún enlace de oferta sin afiliar`);
  }
  assert.doesNotMatch(read('lib/travelpayouts/affiliate.ts'), /document\.|window\.|localStorage|cookie\s*=/, 'solo construye un enlace: sin cookies ni scripts');
});
