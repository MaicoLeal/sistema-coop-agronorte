import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--no-first-run', '--disable-background-networking', '--window-size=1280,853']
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 853, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });
const recorder = await page.screencast({
  path: 'C:/Users/Coop Agronorte/Documents/Coop_Agronorte_Hidroponia/Sistema_Importado/docs/Preview_Tela_Principal_Animada_V2.webm',
  ffmpegPath: 'C:/Users/Coop Agronorte/Documents/Coop_Agronorte_Hidroponia/Animacao_Home/tools/ffmpeg.exe',
  crop: { x: 0, y: 0, width: 1280, height: 853 }
});
await new Promise(resolve => setTimeout(resolve, 12000));
await recorder.stop();
await browser.close();
console.log('Preview gravada.');
