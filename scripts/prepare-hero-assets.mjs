import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sunriseHeroSrc = 'C:/Users/Coop Agronorte/.gemini/antigravity-ide/brain/650cbfea-9ae6-4864-8a9a-c001ee957f5c/agronorte_sunrise_hero_1789521518953.jpg';
const leavesSrc = 'C:/Users/Coop Agronorte/.gemini/antigravity-ide/brain/650cbfea-9ae6-4864-8a9a-c001ee957f5c/tomato_leaves_fg_1789521552064.jpg';

async function run() {
  console.log('Copying background hero image...');
  await fs.copyFile(sunriseHeroSrc, 'public/assets/agronorte-sunrise-hero.jpg');
  console.log('Copied to public/assets/agronorte-sunrise-hero.jpg');

  console.log('Launching browser to process transparent leaf foliage...');
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
  const page = await browser.newPage();

  const leavesBase64 = (await fs.readFile(leavesSrc)).toString('base64');
  const leavesDataUri = `data:image/jpeg;base64,${leavesBase64}`;

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>body { margin: 0; background: transparent; }</style>
    </head>
    <body>
      <canvas id="c"></canvas>
      <script>
        window.processLeaves = async function(dataUri) {
          const img = new Image();
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            img.src = dataUri;
          });

          const canvas = document.getElementById('c');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          // Key out black background while preserving antialiased edges
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Max brightness
            const maxVal = Math.max(r, g, b);
            if (maxVal < 22) {
              data[i + 3] = 0; // Pure transparent
            } else if (maxVal < 65) {
              // Smooth feather
              const alpha = Math.min(255, Math.floor(((maxVal - 22) / 43) * 255));
              data[i + 3] = alpha;
            }
          }

          ctx.putImageData(imgData, 0, 0);
          return canvas.toDataURL('image/png');
        };
      </script>
    </body>
    </html>
  `);

  const pngDataUrl = await page.evaluate((uri) => window.processLeaves(uri), leavesDataUri);
  const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, '');
  await fs.writeFile('public/assets/agronorte-foreground-leaves.png', Buffer.from(base64Data, 'base64'));
  console.log('Saved public/assets/agronorte-foreground-leaves.png');

  console.log('Generating WebP version of sunrise hero...');
  const heroBase64 = (await fs.readFile('public/assets/agronorte-sunrise-hero.jpg')).toString('base64');
  const heroDataUri = `data:image/jpeg;base64,${heroBase64}`;
  const webpDataUrl = await page.evaluate(async (uri) => {
    const img = new Image();
    await new Promise((r) => { img.onload = r; img.src = uri; });
    const c = document.getElementById('c');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.90);
  }, heroDataUri);
  const webpBuffer = Buffer.from(webpDataUrl.replace(/^data:image\/webp;base64,/, ''), 'base64');
  await fs.writeFile('public/assets/agronorte-sunrise-hero.webp', webpBuffer);
  console.log('Saved public/assets/agronorte-sunrise-hero.webp');

  await browser.close();
}

run().catch(console.error);
