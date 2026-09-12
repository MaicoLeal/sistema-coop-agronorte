const puppeteer = require('puppeteer-core');
const path = require('node:path');

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const artifactDir = 'C:/Users/Coop Agronorte/.gemini/antigravity/brain/8e260b8c-790e-4aff-969a-500c903c923b';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // 1. Visit landing page
  console.log('Navigating to landing page http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  // Clear localStorage to ensure fresh seed data
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Take landing screenshot
  const landingPath = path.join(artifactDir, 'final_verification_landing.jpg');
  await page.screenshot({ path: landingPath, type: 'jpeg', quality: 90 });
  console.log(`Landing page captured: ${landingPath}`);

  // 2. Click the center "ENTRAR AL SISTEMA" button hotspot
  console.log('Clicking video enter button...');
  const enterBtn = await page.$('button[title="Entrar no Sistema"]');
  if (enterBtn) {
    await enterBtn.click();
  } else {
    // Click easy button fallback
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('Modo Fácil Produtor')) {
        await b.click();
        break;
      }
    }
  }

  await new Promise(r => setTimeout(r, 2000));

  // Take Producer View screenshot
  const producerPath = path.join(artifactDir, 'final_verification_modo_produtor.jpg');
  await page.screenshot({ path: producerPath, type: 'jpeg', quality: 90 });
  console.log(`Producer view captured: ${producerPath}`);

  // 3. Switch to Executive Management View
  console.log('Switching to Executive Management View...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes('Painel Gestão') || text.includes('Gestão') || text.includes('Especialista'))) {
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2000));

  // Take Executive Dashboard screenshot
  const dashPath = path.join(artifactDir, 'final_verification_dashboard.jpg');
  await page.screenshot({ path: dashPath, type: 'jpeg', quality: 90 });
  console.log(`Executive dashboard captured: ${dashPath}`);

  await browser.close();
  console.log('All screenshots completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
