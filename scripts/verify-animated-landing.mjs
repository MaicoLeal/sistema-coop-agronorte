import puppeteer from 'puppeteer-core';
import path from 'node:path';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const out = 'C:/Users/Coop Agronorte/Documents/Coop_Agronorte_Hidroponia/Sistema_Importado/docs';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--no-first-run', '--disable-background-networking', '--window-size=1440,900']
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', error => consoleErrors.push(String(error)));
await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
await wait(500);
await page.screenshot({ path: path.join(out, 'landing_t0_5.png') });
await wait(4000);
await page.screenshot({ path: path.join(out, 'landing_t4_5.png') });
await wait(6000);
await page.screenshot({ path: path.join(out, 'landing_t10_5.png') });
await wait(500);
await page.screenshot({ path: path.join(out, 'landing_t11_0.png') });

const diagnostics = await page.evaluate(async () => {
  const canvas = document.querySelector('canvas');
  const button = document.querySelector('.landing-hero__enter');
  const gl = canvas?.getContext('webgl');
  let frames = 0;
  const start = performance.now();
  await new Promise(resolve => {
    const tick = now => {
      frames++;
      if (now - start >= 1000) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return {
    canvas: canvas ? { width: canvas.width, height: canvas.height, opacity: getComputedStyle(canvas).opacity } : null,
    button: button ? { aria: button.getAttribute('aria-label'), rect: button.getBoundingClientRect().toJSON() } : null,
    webgl: gl ? {
      renderer: gl.getParameter(gl.RENDERER),
      vendor: gl.getParameter(gl.VENDOR),
      version: gl.getParameter(gl.VERSION),
      error: gl.getError()
    } : null,
    measuredFps: frames,
  };
});

await page.click('.landing-hero__enter');
await page.waitForSelector('aside, nav, header', { timeout: 5000 });
const entered = await page.evaluate(() => !document.querySelector('.landing-hero') && document.body.innerText.includes('Coop Agronorte'));
await page.screenshot({ path: path.join(out, 'dashboard_after_enter.png') });
console.log(JSON.stringify({ diagnostics, consoleErrors, entered }, null, 2));
await browser.close();
if (consoleErrors.length || !entered || !diagnostics.webgl || diagnostics.webgl.error !== 0 || diagnostics.measuredFps < 50) process.exit(1);
