import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 3840, height: 2160 });
await page.goto('http://127.0.0.1:3000/assets/agronorte-reference-hero.jpg');
// The image has 2752 x 1536.
// Let's see how agronorte-reference-hero.jpg is framed!
const refHeroInfo = await page.evaluate(() => {
  const img = document.querySelector('img');
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    aspect: img.naturalWidth / img.naturalHeight,
  };
});
console.log('Reference hero info:', refHeroInfo);
await browser.close();
