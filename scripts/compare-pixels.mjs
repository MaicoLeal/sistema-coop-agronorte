import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.setContent(`
  <canvas id="c" width="1000" height="1000"></canvas>
`);

const diff = await page.evaluate(async () => {
  const loadImg = (src) => new Promise((res) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.src = src;
  });

  const imgRef = await loadImg('http://127.0.0.1:3000/assets/agronorte-reference-hero.jpg');
  const imgScenic = await loadImg('http://127.0.0.1:3000/assets/agronorte-scenic-daylight.jpg');
  
  return {
    ref: { w: imgRef.width, h: imgRef.height },
    scenic: { w: imgScenic.width, h: imgScenic.height },
  };
});

console.log(diff);
await browser.close();
