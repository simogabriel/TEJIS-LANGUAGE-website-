import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  await page.route('https://fonts.gstatic.com/**',route=>route.abort());
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:4180/',{waitUntil:'domcontentloaded'});
  await page.locator('.anti-gravity').waitFor();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.contact-copy').classList.contains('contact-entered'));
  assert.equal(await page.locator('.contact-copy h2').evaluate(el=>getComputedStyle(el).animationName),'contact-text-enter');
  await page.waitForTimeout(1300);
  await page.locator('#contact').screenshot({path:'.tools/qa/contact-refined-desktop.png'});
  for(const lang of ['fr','de','en']) {
    await page.locator(`[data-lang="${lang}"]`).click();
    assert.equal(await page.locator('.contact-copy h2 em').count(),1);
    assert.equal(await page.locator('.contact-copy .whatsapp-cta').getAttribute('href'),'https://wa.me/237694921669');
    await page.setViewportSize({width:393,height:852});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  await page.locator('#contact').screenshot({path:'.tools/qa/contact-refined-mobile.png'});
  await page.locator('.gravity-pause').click();
  await page.waitForFunction(()=>document.body.classList.contains('animations-paused'));
  assert.equal(await page.locator('.contact-copy h2').evaluate(el=>getComputedStyle(el).opacity),'1');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.contact-copy h2').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.deepEqual(errors,[]);
  console.log('Contact animation, WhatsApp link/logo, translations, mobile layout, pause and reduced motion verified.');
} finally {await browser.close();}
