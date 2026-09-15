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
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        margin: 0;
        background: #061813;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        overflow: hidden;
        font-family: 'Hanken Grotesk', sans-serif;
      }
      .artboard {
        position: relative;
        width: 100vw;
        height: 56.25vw;
        max-width: 177.78vh;
        max-height: 100vh;
        overflow: hidden;
        background: #061813;
      }
      .artboard video {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transform-origin: 0 0;
        transform: scale(1.46) translate(-2.5%, -1.0%);
      }

      /* Primary Enter Button directly over the artwork button */
      .enter-hotspot {
        position: absolute;
        left: 52.8%;
        top: 81.8%;
        width: 31.6%;
        height: 10.2%;
        z-index: 15;
        border-radius: 999px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(46, 125, 50, 0.2);
        border: 2px solid transparent;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .enter-hotspot:hover,
      .enter-hotspot:focus-visible {
        background: rgba(56, 142, 60, 0.4);
        border-color: rgba(191, 232, 154, 0.85);
        box-shadow: 0 0 35px rgba(104, 186, 69, 0.65), inset 0 0 20px rgba(191, 232, 154, 0.3);
        transform: scale(1.025);
      }

      /* Sub-actions drawer popping above when hovered */
      .enter-options {
        position: absolute;
        bottom: calc(100% + 12px);
        left: 50%;
        transform: translateX(-50%) translateY(8px);
        display: flex;
        gap: 10px;
        opacity: 0;
        pointer-events: none;
        transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 20;
      }
      .enter-hotspot:hover .enter-options,
      .enter-hotspot:focus-within .enter-options {
        opacity: 1;
        pointer-events: auto;
        transform: translateX(-50%) translateY(0);
      }
      .opt-btn {
        padding: 9px 18px;
        border-radius: 999px;
        border: 1px solid rgba(191, 232, 154, 0.5);
        background: rgba(3, 28, 20, 0.94);
        color: #f7fbf3;
        font-family: inherit;
        font-size: 12px;
        font-weight: 750;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 7px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(14px);
        white-space: nowrap;
        transition: all 0.2s ease;
      }
      .opt-btn:hover {
        background: linear-gradient(135deg, #68ba45, #4caf50);
        color: #061813;
        border-color: #e4ffd0;
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(104, 186, 69, 0.45);
      }
    </style>
  </head>
  <body>
    <div class="artboard">
      <video src="http://127.0.0.1:3000/assets/agronorte-home.mp4" autoplay muted loop></video>
      <div class="enter-hotspot" tabindex="0">
        <div class="enter-options">
          <button class="opt-btn" id="btn-prod">🌾 Modo Produtor (Don Mateo)</button>
          <button class="opt-btn" id="btn-admin">📊 Painel de Gestão</button>
        </div>
      </div>
    </div>
  </body>
  </html>
`);

await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/test-button-match.png' });

await page.hover('.enter-hotspot');
await new Promise(r => setTimeout(r, 300));
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/test-button-hover.png' });

await browser.close();
console.log('Saved button match screenshots');
