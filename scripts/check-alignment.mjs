import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.goto('http://127.0.0.1:3000/assets/agronorte-reference-hero.jpg');
const heroDim = await page.evaluate(() => {
  const img = document.querySelector('img');
  return { w: img.naturalWidth, h: img.naturalHeight };
});

await page.goto('http://127.0.0.1:3000/assets/agronorte-home.mp4');
await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
const videoDim = await page.evaluate(() => {
  const v = document.querySelector('video');
  return { w: v.videoWidth, h: v.videoHeight };
});

console.log('Hero image:', heroDim);
console.log('Video:', videoDim);
await browser.close();
