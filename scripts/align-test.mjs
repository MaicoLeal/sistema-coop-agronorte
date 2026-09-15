import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

// Let's test overlaying the reference image with 50% opacity over the video to find the exact scale and translate
const bestFit = await page.evaluate(async () => {
  // Let's test a range of scale and translate:
  // Video is 3840x2160, Ref is 2752x1536 (ratio 16:9).
  // If we scale the video by S and translate by tx, ty:
  // Let's calculate the crop:
  // In the full video (16:9), the hero section is roughly top: 0 to 73%.
  // 1 / 0.73 ≈ 1.37.
  // If scale is ~1.38, tx is ~ -4% to -6%, ty is ~ 0% to -3%.
  return { test: true };
});

await page.setContent(`
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #000; overflow: hidden; }
      .container {
        position: relative;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
      }
      .ref-img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 1;
        opacity: 0.5;
      }
      .vid-wrapper {
        position: absolute;
        inset: 0;
        overflow: hidden;
        z-index: 0;
      }
      /* Let's try CSS transform on the 4K video */
      video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform-origin: top left;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="vid-wrapper">
        <video id="v" src="http://127.0.0.1:3000/assets/agronorte-home.mp4" autoplay muted loop></video>
      </div>
      <img class="ref-img" src="http://127.0.0.1:3000/assets/agronorte-reference-hero.jpg" />
    </div>
  </body>
  </html>
`);

await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);

// Try different scale & offsets to find exact match
const tests = [
  { scale: 1.365, x: -3.8, y: -0.5 },
  { scale: 1.38, x: -4.2, y: -1.0 },
  { scale: 1.39, x: -4.5, y: -1.2 },
  { scale: 1.40, x: -5.0, y: -1.5 },
];

for (let i = 0; i < tests.length; i++) {
  const t = tests[i];
  await page.evaluate((t) => {
    const v = document.getElementById('v');
    v.style.transform = `scale(${t.scale}) translate(${t.x}%, ${t.y}%)`;
  }, t);
  await page.screenshot({ path: `C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/align-${i}.png` });
}

await browser.close();
console.log('Saved alignment tests');
