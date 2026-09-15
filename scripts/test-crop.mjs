import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

// Test framing the 4K video so that only the hero is visible, exactly cropping out the bottom bar
await page.setContent(`
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #061813; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; }
      .artboard {
        position: relative;
        width: 100vw;
        height: 56.25vw; /* 16:9 */
        max-height: 100vh;
        max-width: 177.78vh;
        overflow: hidden;
      }
      .crop-container {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }
      /* In the original 16:9 video, the hero is in the top ~72%.
         If we scale the video up so the bottom 28% is hidden below the container:
      */
      video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 140%; /* 1 / 0.714 = 1.4 */
        object-fit: cover;
        object-position: top center;
      }
    </style>
  </head>
  <body>
    <div class="artboard">
      <div class="crop-container">
        <video src="http://127.0.0.1:3000/assets/agronorte-home.mp4" autoplay muted loop playsinline></video>
      </div>
    </div>
  </body>
  </html>
`);

await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/test-hero-crop.png' });
await browser.close();
console.log('Saved test-hero-crop.png');
