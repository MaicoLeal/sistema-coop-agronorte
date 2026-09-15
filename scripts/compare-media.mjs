import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
for (const file of ['video-home.mp4', 'agronorte-home.mp4']) {
  await page.goto(`http://127.0.0.1:3000/assets/${file}`);
  await page.waitForFunction(() => {
    const v = document.querySelector('video');
    return v && v.readyState >= 1;
  });
  const info = await page.evaluate(() => {
    const v = document.querySelector('video');
    return {
      duration: v.duration,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      src: v.currentSrc,
    };
  });
  console.log(file, info);
}
await browser.close();
