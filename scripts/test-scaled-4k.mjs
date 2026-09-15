import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

await page.setContent(`
  <!DOCTYPE html>
  <html>
  <head>
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
      .video-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      /* Let's try transform: scale and translate on the 4K video */
      .artboard video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform-origin: 0 0;
        transform: scale(1.41) translate(-4.8%, -1.2%);
      }
    </style>
  </head>
  <body>
    <div class="artboard">
      <div class="video-layer">
        <video src="http://127.0.0.1:3000/assets/agronorte-home.mp4" autoplay muted loop></video>
      </div>
    </div>
  </body>
  </html>
`);

await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/test-scaled-4k.png' });
await browser.close();
console.log('Saved test-scaled-4k.png');
