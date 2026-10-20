import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('.tools/qa', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://localhost:4180/', { waitUntil:'domcontentloaded' });
  await page.locator('.anti-gravity').waitFor();
  assert.equal(await page.locator('header + #anti-gravity-root .anti-gravity').count(), 1);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.waitForFunction(() => document.querySelector('.offline-status')?.textContent.includes('saved'));
  await page.screenshot({ path: '.tools/qa/desktop.png' });
  const initialTransform = await page.locator('.gravity-passport').evaluate(el => getComputedStyle(el).translate);
  await page.waitForTimeout(500);
  assert.notEqual(await page.locator('.gravity-passport').evaluate(el => getComputedStyle(el).translate), initialTransform);
  await page.locator('.gravity-pause').click();
  assert.equal(await page.locator('.gravity-passport').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
  await page.locator('.gravity-pause').click();
  await context.setOffline(true);
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.locator('.anti-gravity').waitFor();
  for (const lang of ['en','fr','de']) {
    await page.locator(`[data-lang="${lang}"]`).click();
    await page.waitForFunction(lang => document.querySelector('video source')?.src.includes(`-${lang}.mp4`), lang);
    await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
    await page.locator('video').evaluate(async video => { await video.play(); });
    await page.waitForTimeout(350);
    assert(await page.locator('video').evaluate(video => video.currentTime > 0 && !video.paused));
    await page.locator('video').evaluate(video => { video.currentTime = 24; });
    await page.waitForFunction(() => document.querySelector('video').currentTime >= 24 && !document.querySelector('video').seeking);
    await page.locator('video').evaluate(video => video.pause());
    const range = await page.evaluate(async lang => {
      const response = await fetch(`/assets/language-tests-${lang}.mp4`, {headers:{Range:'bytes=100-199'}});
      return {status:response.status, length:(await response.arrayBuffer()).byteLength};
    }, lang);
    assert.deepEqual(range, {status:206,length:100});
    console.log(`${lang}: offline reload, playback, seeking, and byte ranges passed`);
  }
  await page.locator('[data-lang="en"]').click();
  await page.setViewportSize({width:393,height:852});
  await page.evaluate(() => scrollTo(0,0));
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile layout overflows');
  await page.locator('.menu').click();
  assert.equal(await page.locator('nav').evaluate(el => getComputedStyle(el).display), 'flex');
  await page.screenshot({path:'.tools/qa/mobile.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.gravity-passport').evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.deepEqual(errors,[]);
  console.log('Desktop/mobile layout, floating animation, pause control, reduced motion, and browser errors passed');
} finally { await browser.close(); }
