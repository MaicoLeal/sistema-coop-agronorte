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
    body { margin: 0; background: #061813; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    .artboard {
      position: relative;
      width: 100vw;
      height: 56.25vw;
      max-width: 177.78vh;
      max-height: 100vh;
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
    <video src="http://127.0.0.1:3000/assets/video-home.mp4" autoplay muted loop></video>
  </div>
`);

await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/test-video-home-cropped.png' });
await browser.close();
console.log('Saved test-video-home-cropped.png');
