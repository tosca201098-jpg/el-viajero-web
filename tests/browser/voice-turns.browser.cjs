// Explicit smoke test for the Sofía Preview UI. Voice/provider requests are blocked.
// Detailed SDK/tool/cancellation coverage: tests/voice-*.test.cjs.
const {test}=require('node:test'),assert=require('node:assert/strict');
const {chromium}=require(process.env.VOICE_PLAYWRIGHT_PATH||'playwright');
const base=process.env.VOICE_TEST_URL||'http://127.0.0.1:3100';
for(const viewport of [{width:1440,height:1000},{width:390,height:844}]) test('Sofía unavailable safely: '+viewport.width,async t=>{
 const browser=await chromium.launch({headless:true,...(process.env.VOICE_BROWSER_EXECUTABLE?{executablePath:process.env.VOICE_BROWSER_EXECUTABLE}:{})});
 t.after(()=>browser.close());const page=await browser.newPage({viewport});
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.origin!==new URL(base).origin)return route.abort();
  if(url.pathname.startsWith('/api/'))return route.fulfill({status:503,json:{error:'ai_unavailable'}});
  return route.continue();
 });
 await page.goto(base);
 await page.locator('button[aria-pressed]').filter({hasText:'🎙️'}).click();
 await page.getByRole('alert').first().waitFor({state:'visible'});
 assert.equal(await page.locator('button[aria-pressed]').filter({hasText:'🎙️'}).getAttribute('aria-pressed'),'false');
});
