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
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #061813; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    .artboard {
      position: relative;
      width: 100vw;
      height: 56.25vw;
      max-width: 177.78vh;
      max-height: 100vh;
      overflow: hidden;
    }
    .fallback {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.5;
      z-index: 2;
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
      z-index: 1;
    }
  </style>
  <div class="artboard">
    <video src="http://127.0.0.1:3000/assets/video-home.mp4" autoplay muted></video>
    <img class="fallback" src="http://127.0.0.1:3000/assets/agronorte-reference-hero.jpg" />
  </div>
`);

await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
await page.evaluate(() => {
  document.querySelector('video').currentTime = 0;
});
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/verify-image-video-match.png' });
await browser.close();
console.log('Saved verify-image-video-match.png');
