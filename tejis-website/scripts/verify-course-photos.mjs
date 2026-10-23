import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://localhost:4180/',{waitUntil:'networkidle'});
 await p.emulateMedia({reducedMotion:'reduce'});
 await p.locator('#courses').scrollIntoViewIfNeeded();
 for(const photo of await p.locator('.course img.course-photo').all()){
  await photo.scrollIntoViewIfNeeded();await photo.evaluate(i=>i.decode());
  assert(await photo.evaluate(i=>i.naturalWidth>=900));
 }
 assert.equal(await p.locator('.course img.course-photo').count(),6);
 assert.equal(await p.locator('.course .photo-credit').count(),6);
 for(const lang of ['fr','de','en']){
  await p.locator(`[data-lang="${lang}"]`).click();
  assert((await p.locator('[data-course="russian"] .course-location').textContent()).includes({en:'MOSCOW',fr:'MOSCOU',de:'MOSKAU'}[lang]));
  assert((await p.locator('[data-course="spanish"] .course-location').textContent()).includes('MADRID'));
 }
 for(const width of [320,393,768,1440]){
  await p.setViewportSize({width,height:1000});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 await p.setViewportSize({width:1440,height:1100});
 await p.locator('.course-grid').screenshot({path:'.tools/qa/course-city-cards.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: six local city photographs, photo credits, translated location labels, and responsive layout at 320, 393, 768 and 1440px.');
}finally{await b.close()}
