import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 2752, height: 1536, deviceScaleFactor: 1 });

await page.setContent(`
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #061813; overflow: hidden; }
    .artboard {
      position: relative;
      width: 2752px;
      height: 1536px;
      overflow: hidden;
    }
    video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform-origin: 0 0;
      transform: scale(1.46) translate(-2.5%, -1.0%);
    }
  </style>
  <div class="artboard">
    <video src="http://127.0.0.1:3000/assets/agronorte-home.mp4" muted></video>
  </div>
`);

await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
await page.evaluate(() => {
  const v = document.querySelector('video');
  v.currentTime = 0;
});
await new Promise(r => setTimeout(r, 400));
const buffer = await page.screenshot({ type: 'jpeg', quality: 98 });
await fs.writeFile('C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/new-reference-hero.jpg', buffer);
console.log('Saved new-reference-hero.jpg', buffer.length, 'bytes');
await browser.close();
