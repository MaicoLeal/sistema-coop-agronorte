import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto('http://127.0.0.1:3000/assets/agronorte-home.mp4');
await page.waitForFunction(() => {
  const v = document.querySelector('video');
  return v && v.readyState >= 2;
});
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/agronorte-home-frame.png' });
await browser.close();
console.log('Saved agronorte-home-frame.png');
