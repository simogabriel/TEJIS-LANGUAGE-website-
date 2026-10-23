import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
fs.mkdirSync('.tools/qa',{recursive:true});
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:4180/',{waitUntil:'networkidle'});
 const expected=['67,500','67,500','135,000','45,000','135,000','135,000'];
 assert.deepEqual(await p.locator('.course .price strong').allTextContents(),expected);
 assert.equal(await p.locator('.course .offer-price-label').count(),6);
 for(const lang of ['en','fr','de']){
  await p.locator(`[data-lang="${lang}"]`).click();
  const offer=await p.locator('.enrolment-offer').innerText();
  assert(offer.includes('15'));assert(/10\s?%/.test(offer));
  assert(!/20\s?%/.test(await p.locator('body').innerText()));
  for(const label of await p.locator('.offer-price-label').allTextContents()) assert(/10\s?%/.test(label)&&label.includes('15'));
 }
 await p.locator('[data-lang="en"]').click();
 for(const width of [320,375,393,768,1024,1440]){
  await p.setViewportSize({width,height:900});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow at ${width}`);
  assert(await p.locator('header .tejis-logo').evaluate(i=>i.complete&&i.naturalWidth>0));
  for(const selector of ['.course .price','.enrolment-offer']){
   for(const box of await p.locator(selector).evaluateAll(nodes=>nodes.map(n=>({w:n.clientWidth,s:n.scrollWidth}))))assert(box.s<=box.w+1,`${selector} text overflows at ${width}`);
  }
  await p.evaluate(()=>scrollTo(0,0));
  if([393,1440].includes(width))await p.screenshot({path:`.tools/qa/offer-${width}.png`});
 }
 await p.setViewportSize({width:393,height:852});await p.locator('.menu').click();assert.equal(await p.locator('.menu').getAttribute('aria-expanded'),'true');
 await p.locator('nav a[href="#contact"]').click();assert.equal(await p.locator('.menu').getAttribute('aria-expanded'),'false');
 const video=p.locator('#tejis-video video');await video.scrollIntoViewIfNeeded();await video.evaluate(v=>{v.load();return new Promise((r,j)=>{v.onloadedmetadata=r;v.onerror=j})});assert(Math.abs(await video.evaluate(v=>v.duration)-50)<.1);
 await video.evaluate(async v=>{v.muted=true;await v.play()});await p.waitForFunction(()=>document.querySelector('#tejis-video video').currentTime>.1);
 assert.deepEqual(errors,[]);
 console.log('PASS: prices and offer in EN/FR/DE; logo loaded; responsive at 320, 375, 393, 768, 1024 and 1440px; navigation and 50-second video playback; no browser errors.');
}finally{await b.close()}
