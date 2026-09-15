import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

const configs = [
  { name: 'crop-A', scale: 1.45, x: -2.0, y: -0.5 },
  { name: 'crop-B', scale: 1.46, x: -2.5, y: -1.0 },
  { name: 'crop-C', scale: 1.48, x: -3.0, y: -1.2 },
  { name: 'crop-D', scale: 1.50, x: -3.2, y: -1.5 },
];

for (const cfg of configs) {
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
        .artboard video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform-origin: 0 0;
          transform: scale(${cfg.scale}) translate(${cfg.x}%, ${cfg.y}%);
        }
      </style>
    </head>
    <body>
      <div class="artboard">
        <video src="http://127.0.0.1:3000/assets/agronorte-home.mp4" autoplay muted loop></video>
      </div>
    </body>
    </html>
  `);

  await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: `C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/${cfg.name}.png` });
}

await browser.close();
console.log('Saved fine-tune test images');
