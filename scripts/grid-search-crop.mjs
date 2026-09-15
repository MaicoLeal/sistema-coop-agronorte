import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
// Run at 960x540 for fast pixel comparison
await page.setViewport({ width: 960, height: 540 });

await page.goto('http://127.0.0.1:3000/');
await page.setContent(`
  <style>
    body { margin: 0; background: #000; overflow: hidden; }
    #ref { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    #v { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: top left; }
    canvas { display: none; }
  </style>
  <img id="ref" src="http://127.0.0.1:3000/assets/agronorte-reference-hero.jpg" />
  <video id="v" src="http://127.0.0.1:3000/assets/agronorte-home.mp4" autoplay muted loop></video>
  <canvas id="cRef" width="480" height="270"></canvas>
  <canvas id="cVid" width="480" height="270"></canvas>
`);

await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
await new Promise(r => setTimeout(r, 500));

const best = await page.evaluate(async () => {
  const cRef = document.getElementById('cRef');
  const cVid = document.getElementById('cVid');
  const ctxRef = cRef.getContext('2d');
  const ctxVid = cVid.getContext('2d');
  const imgRef = document.getElementById('ref');
  const video = document.getElementById('v');

  // Draw reference image once
  ctxRef.drawImage(imgRef, 0, 0, 480, 270);
  const dataRef = ctxRef.getImageData(0, 0, 480, 270).data;

  // Let's grid search:
  // We want to match the top-left logo and the greenhouse
  // Let's sample pixels in the region y: 0 to 180 (top 66%), x: 40 to 440
  let minDiff = Infinity;
  let bestParams = null;

  for (let s = 1.30; s <= 1.50; s += 0.02) {
    for (let x = -8; x <= -2; x += 0.5) {
      for (let y = -4; y <= 2; y += 0.5) {
        video.style.transform = `scale(${s}) translate(${x}%, ${y}%)`;
        ctxVid.clearRect(0, 0, 480, 270);
        // Draw video element with its styling into canvas
        // Canvas drawImage doesn't take CSS transform into account, so we compute source rect!
        // In video coordinates (3840 x 2160):
        // scale s, translate (x%, y%):
        // viewport shows:
        // left in video = -x% * 3840 / s ... wait:
        // let's draw using an auxiliary element or compute sx, sy, sw, sh directly:
        const sw = 3840 / s;
        const sh = 2160 / s;
        // translate x% shifts video right by x% * 3840?
        // In CSS: translate(x%, y%) is relative to the element's own width (3840).
        // If element is scaled by s and translated by x%:
        // x% of 3840 = 38.4 * x.
        const sx = -(x / 100) * 3840;
        const sy = -(y / 100) * 2160;
        
        if (sx < 0 || sy < 0 || sx + sw > 3840 || sy + sh > 2160) continue;

        ctxVid.drawImage(video, sx, sy, sw, sh, 0, 0, 480, 270);
        const dataVid = ctxVid.getImageData(0, 0, 480, 270).data;

        let diff = 0;
        let count = 0;
        // Sample every 4th pixel in the upper half
        for (let py = 10; py < 180; py += 4) {
          for (let px = 20; px < 460; px += 4) {
            const idx = (py * 480 + px) * 4;
            const dr = dataRef[idx] - dataVid[idx];
            const dg = dataRef[idx+1] - dataVid[idx+1];
            const db = dataRef[idx+2] - dataVid[idx+2];
            diff += Math.abs(dr) + Math.abs(dg) + Math.abs(db);
            count++;
          }
        }
        const avgDiff = diff / count;
        if (avgDiff < minDiff) {
          minDiff = avgDiff;
          bestParams = { s, x, y, sx, sy, sw, sh, avgDiff };
        }
      }
    }
  }
  return bestParams;
});

console.log('Best params:', best);
await browser.close();
