import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const out = resolve('docs/landing-review');
await mkdir(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-first-run', '--disable-background-networking', '--enable-unsafe-swiftshader'],
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const page = await browser.newPage();
const errors = [];
page.on('pageerror', error => errors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

// Read pixels immediately after a draw (the canvas does not preserve its buffer).
const pixels = () => page.evaluate(() => new Promise(resolve => {
  requestAnimationFrame(() => {
    const canvas = document.querySelector('.landing-scene__canvas');
    const gl = canvas.getContext('webgl');
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    const regions = { flag: [.496, .361, .522, .420], crops: [.79, .46, .95, .79], sun: [.40, .34, .49, .44] };
    const aspect = 1376 / 768;
    const view = canvas.width / canvas.height;
    const visible = [Math.min(1, view / aspect), Math.min(1, aspect / view)];
    const result = {};
    for (const [name, r] of Object.entries(regions)) {
      const x = Math.max(0, Math.round(((r[0] - .5) / visible[0] + .5) * canvas.width));
      const y = Math.max(0, Math.round((.5 - (r[3] - .5) / visible[1]) * canvas.height));
      const width = Math.min(canvas.width - x, Math.round((r[2] - r[0]) / visible[0] * canvas.width));
      const height = Math.min(canvas.height - y, Math.round((r[3] - r[1]) / visible[1] * canvas.height));
      const bytes = new Uint8Array(width * height * 4);
      gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      let hash = 2166136261;
      for (const value of bytes) hash = Math.imul(hash ^ value, 16777619) >>> 0;
      result[name] = hash;
    }
    result.error = gl.getError();
    resolve(result);
  });
}));

try {
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.landing-scene__canvas')?.style.opacity === '1');
  await page.screenshot({ path: resolve(out, 'desktop-dawn.png'), fullPage: true });
  const early = await pixels();
  await delay(1400);
  const later = await pixels();
  assert.notEqual(early.flag, later.flag, 'Flag pixels should move');
  assert.notEqual(early.crops, later.crops, 'Crop pixels should move');
  assert.notEqual(early.sun, later.sun, 'Sunrise should progress');
  assert.equal(later.error, 0, 'No WebGL error');
  console.log('PASS: animated flag, crops, sunrise and WebGL');
  await delay(7500);
  await page.screenshot({ path: resolve(out, 'desktop-sunrise.png'), fullPage: true });
  const steady = await pixels();
  await delay(700);
  const breeze = await pixels();
  assert.notEqual(steady.flag, breeze.flag, 'Flag should wave after sunrise');
  assert.notEqual(steady.crops, breeze.crops, 'Plants should sway after sunrise');
  await page.click('.landing-motion');
  const frozen = await pixels();
  await delay(300);
  assert.deepEqual(await pixels(), frozen, 'Pause must freeze the scene');
  await page.click('.landing-motion');
  await delay(400);
  assert.notEqual((await pixels()).flag, frozen.flag, 'Resume should restart wind');
  const beforeHover = await page.$eval('.landing-stat', e => getComputedStyle(e).backgroundColor);
  await page.hover('.landing-stat');
  await delay(400);
  const afterHover = await page.$eval('.landing-stat', e => getComputedStyle(e).backgroundColor);
  assert.notEqual(beforeHover, afterHover, 'Statistics should respond to hover');
  console.log('PASS: continuous wind, pause/resume and hover');
  await page.screenshot({ path: resolve(out, 'desktop-hover.png'), fullPage: true });
  await page.click('.landing-languages button[lang="pt"]');
  assert.match(await page.$eval('h1', e => e.textContent), /PRECISÃO/);
  await page.click('.landing-entry');
  await page.waitForFunction(() => !document.querySelector('.agronorte-landing'));
  const sizes = [[390, 844], [320, 740], [768, 1024], [1366, 768]];
  for (const [width, height] of sizes) {
    await page.setViewport({ width, height });
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.landing-scene__canvas')?.style.opacity === '1');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No overflow at ${width}`);
    assert.equal(await page.$$eval('.landing-stat', nodes => nodes.every(e => e.getBoundingClientRect().width > 0)), true);
    if (width === 390 || width === 1366) await page.screenshot({ path: resolve(out, `layout-${width}.png`), fullPage: true });
  }
  console.log('PASS: language, primary entry and responsive layouts');
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelector('.landing-scene__canvas')?.style.opacity === '1');
  assert.equal(await page.$('.landing-motion'), null);
  const still = await pixels();
  await delay(400);
  assert.deepEqual(await pixels(), still, 'Reduced motion should be static');
  await page.click('.landing-producer');
  await page.waitForFunction(() => !document.querySelector('.agronorte-landing'));
  assert.deepEqual(errors, [], 'No browser errors');
  console.log(JSON.stringify({ result: 'PASS', checked: ['sunrise', 'flag', 'crops', 'pause/resume', 'hover', 'languages', 'both entry buttons', '320/390/768/1366 responsive', 'reduced motion'], screenshots: out }, null, 2));
} finally {
  await browser.close();
}
