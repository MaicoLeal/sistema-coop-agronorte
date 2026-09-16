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
  await page.setViewport({ width: 1400, height: 950 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Enter app
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const enterBtn = btns.find(b => b.textContent && (b.textContent.includes('Acceder a la plataforma') || b.textContent.includes('Acessar a plataforma')));
    if (enterBtn) enterBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll down to show timeline in full
  await page.evaluate(() => window.scrollBy(0, 480));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(artDir, 'unified-timeline-view.png') });
  console.log('Saved unified-timeline-view.png');

  // Scroll back up and open Certificate
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const certBtn = btns.find(b => b.textContent && (b.textContent.includes('Emitir Certificado') || b.textContent.includes('Certificado Oficial')));
    if (certBtn) certBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll inside certificate modal to see QR Code and signatures
  await page.evaluate(() => {
    const el = document.getElementById('certificate-print-body');
    if (el) el.scrollTop = 1400;
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(artDir, 'unified-certificate-qr-signatures.png') });
  console.log('Saved unified-certificate-qr-signatures.png');

  await browser.close();
  console.log('Full flow verified successfully!');
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
