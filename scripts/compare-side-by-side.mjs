import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.setContent(`
  <style>
    body { margin: 0; background: #000; display: flex; }
    img, video { width: 50vw; height: auto; object-fit: contain; }
  </style>
  <img src="http://127.0.0.1:3000/assets/agronorte-reference-hero.jpg" />
  <video src="http://127.0.0.1:3000/assets/agronorte-home.mp4" autoplay muted></video>
`);
await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/side-by-side.png' });
await browser.close();
console.log('Saved side-by-side.png');
