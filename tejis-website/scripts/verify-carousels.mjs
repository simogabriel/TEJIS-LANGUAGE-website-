import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
console.log('Starting responsive carousel checks');
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,timeout:15000});
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.route('https://fonts.googleapis.com/**',route=>route.abort());
  await page.route('https://fonts.gstatic.com/**',route=>route.abort());
  page.setDefaultTimeout(10000);
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:4180/',{waitUntil:'domcontentloaded'});
  await page.locator('.anti-gravity').waitFor();
  assert.equal(await page.locator('.course-grid.is-carousel').count(),0);
  assert.equal(await page.locator('.carousel-controls').count(),1);
  for(const width of [1440,1024,768,393,320]) {
    await page.setViewportSize({width,height:1000});
    console.log('Checking viewport',width);
    for(const selector of ['.detail-grid']) {
      const track=page.locator(selector);
      await track.scrollIntoViewIfNeeded();
      await track.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
      await page.waitForTimeout(100);
      assert(await track.evaluate(el=>el.scrollWidth>el.clientWidth),'No slide at '+width);
      const controls=track.locator('xpath=following-sibling::*[1]');
      await controls.locator('.next').click();
      await page.waitForFunction(selector=>document.querySelector(selector).scrollLeft>20,selector);
      await track.focus();await page.keyboard.press('Home');
      await page.waitForFunction(selector=>document.querySelector(selector).scrollLeft<3,selector);
      await page.keyboard.press('End');
      await page.waitForFunction(selector=>{const el=document.querySelector(selector);return el.scrollLeft>=el.scrollWidth-el.clientWidth-3;},selector);
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Page overflow '+width);
    if(width<=1100) {
      await page.evaluate(()=>scrollTo(0,600));
      const header=await page.locator('header').boundingBox();
      assert(header.y>=-1&&header.y<=1,'Header not sticky');
      assert(await page.locator('.menu').isVisible(),'Missing menu');
      assert(await page.locator('header nav').isVisible(),'Collapsed navigation missing');
      await page.locator('.menu').click();
      assert.equal(await page.locator('.menu').getAttribute('aria-expanded'),'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.menu').getAttribute('aria-expanded'),'false');
      assert(await page.locator('header nav').isVisible());
    }
    assert(await page.locator('.course-grid').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'Photo grid should not slide');
    console.log(width+': static photo grid, preparation slider, keys, layout and navigation passed');
  }
  await page.setViewportSize({width:768,height:1024});
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:'.tools/qa/carousel-tablet-nav.png'});
  for(const lang of ['fr','de','en']) {
    await page.locator(`[data-lang="${lang}"]`).click();
    await page.setViewportSize({width:393,height:852});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert(await page.locator('header nav').isVisible());
  }
  await page.locator('.detail-grid').evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
  await page.waitForTimeout(150);
  await page.locator('#course-details').screenshot({path:'.tools/qa/details-carousel-mobile.png'});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.detail-grid').scrollIntoViewIfNeeded();
  await page.locator('.carousel-autoplay').click();
  await page.locator('.detail-grid').evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
  await page.locator('.carousel-autoplay').click();
  await page.mouse.move(0,0);
  await page.evaluate(()=>document.activeElement.blur());
  const started=Date.now();
  await page.waitForFunction(()=>document.querySelector('.detail-grid').scrollLeft>20,undefined,{timeout:2500});
  const elapsed=Date.now()-started;
  assert(elapsed>=1000&&elapsed<2300,'Autoplay timing '+elapsed);
  await page.locator('.carousel-autoplay').click();
  await page.mouse.move(0,0);await page.evaluate(()=>document.activeElement.blur());
  await page.waitForTimeout(650);
  const stopped=await page.locator('.detail-grid').evaluate(el=>el.scrollLeft);
  await page.waitForTimeout(1400);
  assert(Math.abs(await page.locator('.detail-grid').evaluate(el=>el.scrollLeft)-stopped)<2,'Pause did not stop automatic sliding');
  console.log('Automatic slide at '+elapsed+'ms including movement onset; pause verified');
  assert.deepEqual(errors,[]);
  console.log('Translations and browser error checks passed');
} finally { await browser.close(); }
