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
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelectorAll('#about .about-panel-entered').length===2);
  assert.equal(await page.locator('.about-copy h2').evaluate(el=>getComputedStyle(el).animationName),'about-copy-enter');
  assert.equal(await page.locator('.about-visual .globe svg').evaluate(el=>getComputedStyle(el).animationName),'about-globe-orbit');
  await page.waitForTimeout(1500);
  await page.locator('#about').screenshot({path:'.tools/qa/about-refined-desktop.png'});
  for(const lang of ['fr','de','en']) {
    await page.locator(`[data-lang="${lang}"]`).click();
    await page.setViewportSize({width:393,height:852});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.equal(await page.locator('.about-copy > a').getAttribute('href'),'#contact');
  }
  await page.locator('#about').screenshot({path:'.tools/qa/about-refined-mobile.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.about-visual .globe svg').evaluate(el=>getComputedStyle(el).animationName),'none');
  assert.deepEqual(errors,[]);
  console.log('About-panel animations, globe, translations, mobile layout and reduced motion verified.');
}finally{await browser.close();}
