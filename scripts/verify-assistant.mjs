import puppeteer from 'puppeteer-core';
import path from 'path';

const artDir = 'C:/Users/Coop Agronorte/.gemini/antigravity-ide/brain/6dd61ebd-e0e1-4e68-a62c-de0fcb6da7d5';

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 850 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Enter app from landing page
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const enterBtn = btns.find(b => b.textContent && (b.textContent.includes('Acceder a la plataforma') || b.textContent.includes('Acessar a plataforma')));
    if (enterBtn) enterBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll down slightly so Card 3 and Card 4 are fully visible
  await page.evaluate(() => window.scrollBy(0, 320));
  await new Promise(r => setTimeout(r, 500));

  // Screenshot 1: New Producer Panel with Card 4 (Apontamento Técnico)
  await page.screenshot({ path: path.join(artDir, 'don-mateo-live-panel-new.png') });
  console.log('Saved panel with new Card 4');

  // Click on 'Lançar Dados Manuais de Campo'
  await page.waitForSelector('#btn-open-manual-entry', { timeout: 5000 });
  await page.evaluate(() => {
    const b = document.getElementById('btn-open-manual-entry');
    if (b) b.click();
  });
  console.log('Clicked #btn-open-manual-entry via evaluate');
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot 2: Manual Field Entry Modal
  await page.screenshot({ path: path.join(artDir, 'don-mateo-live-manual-modal.png') });
  console.log('Saved manual modal screenshot');

  // Fill in some manual data
  await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.value = 'Medição matinal realizada com condutivímetro e pHmetro calibrados. Cortinas abertas para aeração da Estufa 1.';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 400));

  // Click Submit button in the modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.find(b => b.textContent && (b.textContent.includes('Gravar Apontamento Oficial') || b.textContent.includes('Guardar Apunte Oficial')));
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Screenshot 3: Success Confirmation Screen
  await page.screenshot({ path: path.join(artDir, 'don-mateo-live-manual-success.png') });
  console.log('Saved manual success screenshot');

  await browser.close();
  console.log('All verification tasks finished successfully!');
}

verify().catch(console.error);
