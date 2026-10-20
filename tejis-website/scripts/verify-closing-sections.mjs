import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  await page.route('https://fonts.gstatic.com/**',route=>route.abort());
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://localhost:4180/',{waitUntil:'domcontentloaded'});
  await page.locator('.anti-gravity').waitFor();
  assert.equal(await page.locator('.reference-card').count(),4);
  assert.deepEqual(await page.locator('.reference-card').evaluateAll(links=>links.map(link=>new URL(link.href).hostname)),['ielts.org','www.france-education-international.fr','www.lefrancaisdesaffaires.fr','www.goethe.de']);
  await page.locator('#references').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.reference-card').classList.contains('closing-in-view'));
  assert.equal(await page.locator('.reference-card').first().evaluate(el=>getComputedStyle(el).animationName),'closing-section-enter');
  await page.waitForTimeout(1200);
  await page.locator('#references').screenshot({path:'.tools/qa/references-refined.png'});
  const first=page.locator('.faq-list details').first();
  await first.locator('summary').focus();await page.keyboard.press('Enter');
  assert(await first.evaluate(el=>el.open));
  await first.locator('p').waitFor({state:'visible'});
  await page.keyboard.press('Enter');assert.equal(await first.evaluate(el=>el.open),false);
  await page.locator('#faqs').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1100);
  await page.locator('#faqs').screenshot({path:'.tools/qa/faq-refined.png'});
  for(const width of [1440,768,393,320]) {
    await page.setViewportSize({width,height:1000});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow '+width);
  }
  for(const lang of ['fr','de','en']) {
    await page.locator(`[data-lang="${lang}"]`).click();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.equal(await page.locator('footer .footer-journey a').getAttribute('href'),'tel:+237694921669');
  }
  await page.setViewportSize({width:393,height:852});
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('footer').classList.contains('closing-in-view'));
  await page.waitForTimeout(1100);
  await page.locator('footer').screenshot({path:'.tools/qa/footer-refined-mobile.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.reference-card').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.deepEqual(errors,[]);
  console.log('Reference links, closing animations, keyboard FAQs, phone footer, translations and responsive layouts verified.');
}finally{await browser.close();}
