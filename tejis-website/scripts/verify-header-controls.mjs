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
  assert.equal(await page.locator('.nav-cta').evaluate(el=>getComputedStyle(el,'::after').animationName),'header-course-arrow');
  for(const width of [1440,1024,768,393,320]) {
    await page.setViewportSize({width,height:1000});
    for(const lang of ['fr','de','en']) {
      await page.locator(`[data-lang="${lang}"]`).click();
      await page.waitForFunction(lang=>document.querySelector('.languages').dataset.active===lang,lang);
      assert.equal(await page.locator(`[data-lang="${lang}"]`).getAttribute('aria-pressed'),'true');
      assert(await page.locator('.nav-cta').isVisible());
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Overflow '+width+' '+lang);
    }
    console.log(width+': language selector, translations, visible course action and layout passed');
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.nav-cta').click();
  await page.waitForFunction(()=>location.hash==='#courses');
  const header=await page.locator('header').boundingBox(),courses=await page.locator('#courses').boundingBox();
  assert(courses.y>=header.height-2,'Course heading hidden behind header');
  assert.equal(await page.locator('.nav-cta').evaluate(el=>getComputedStyle(el,'::after').animationName),'none');
  await page.screenshot({path:'.tools/qa/header-controls-mobile.png'});
  assert.deepEqual(errors,[]);
  console.log('Course destination, reduced motion, and browser errors passed');
}finally{await browser.close();}
