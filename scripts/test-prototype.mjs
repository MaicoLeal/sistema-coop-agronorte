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
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;700;800&display=swap" rel="stylesheet">
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
        box-shadow: 0 0 80px rgba(0,0,0,0.8);
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

      /* Subtle ambient vignette to ground the composition */
      .vignette {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(circle at 50% 45%, transparent 60%, rgba(2, 15, 11, 0.25) 100%);
      }

      /* Top controls */
      .toolbar {
        position: absolute;
        top: 3.5%;
        right: 3%;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10;
      }
      .lang-group {
        display: flex;
        padding: 3px;
        background: rgba(3, 28, 20, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 999px;
        backdrop-filter: blur(12px);
      }
      .lang-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.7);
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 800;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .lang-btn.active {
        background: #bfe89a;
        color: #061813;
      }
      .motion-btn {
        background: rgba(3, 28, 20, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.25);
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        backdrop-filter: blur(12px);
        transition: all 0.2s ease;
      }
      .motion-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: scale(1.05);
      }

      /* Interactive Feature Hotspots on the bottom-left */
      .features-container {
        position: absolute;
        left: 0.8%;
        bottom: 4.8%;
        width: 44.5%;
        height: 15.5%;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        z-index: 10;
      }
      .feature-hotspot {
        position: relative;
        cursor: pointer;
        border-radius: 12px;
        border: 1px solid transparent;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .feature-hotspot:hover {
        background: rgba(104, 186, 69, 0.12);
        border-color: rgba(191, 232, 154, 0.45);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35), inset 0 0 15px rgba(104, 186, 69, 0.2);
        transform: translateY(-3px);
      }
      .feature-tooltip {
        position: absolute;
        bottom: 105%;
        left: 50%;
        transform: translateX(-50%) translateY(6px);
        background: rgba(4, 28, 20, 0.92);
        border: 1px solid rgba(191, 232, 154, 0.5);
        color: #f7fbf3;
        padding: 8px 12px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: all 0.2s ease;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        backdrop-filter: blur(12px);
      }
      .feature-hotspot:hover .feature-tooltip {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      /* Primary Enter Button Hotspot & Interactive Overlay */
      .enter-wrapper {
        position: absolute;
        left: 48.5%;
        bottom: 8.8%;
        transform: translateX(-50%);
        z-index: 15;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .enter-btn-main {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        width: 320px;
        height: 52px;
        border-radius: 999px;
        background: linear-gradient(135deg, rgba(46, 125, 50, 0.95), rgba(76, 175, 80, 0.95));
        border: 1.5px solid rgba(215, 242, 196, 0.8);
        color: #ffffff;
        font-family: inherit;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(28, 112, 40, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.35);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: blur(10px);
      }
      .enter-btn-main::after {
        content: '';
        position: absolute;
        inset: -2px;
        border-radius: 999px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        opacity: 0;
        transition: opacity 0.3s;
      }
      .enter-wrapper:hover .enter-btn-main {
        transform: scale(1.025) translateY(-2px);
        border-color: #e4ffd0;
        box-shadow: 0 0 30px rgba(104, 186, 69, 0.6), 0 14px 36px rgba(0, 0, 0, 0.45);
      }
      .enter-wrapper:hover .enter-btn-main::after {
        opacity: 1;
      }

      /* Roles choice popover on hover */
      .roles-popover {
        position: absolute;
        bottom: calc(100% + 10px);
        display: flex;
        gap: 8px;
        opacity: 0;
        pointer-events: none;
        transform: translateY(8px);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .enter-wrapper:hover .roles-popover,
      .enter-wrapper:focus-within .roles-popover {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }
      .role-chip {
        padding: 7px 14px;
        border-radius: 999px;
        border: 1px solid rgba(191, 232, 154, 0.4);
        background: rgba(3, 28, 20, 0.9);
        color: #f7fbf3;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        backdrop-filter: blur(12px);
        transition: all 0.2s ease;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
      }
      .role-chip:hover {
        background: #68ba45;
        color: #061813;
        border-color: #bfe89a;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(104, 186, 69, 0.4);
      }
    </style>
  </head>
  <body>
    <div class="artboard">
      <video src="http://127.0.0.1:3000/assets/agronorte-home.mp4" autoplay muted loop></video>
      <div class="vignette"></div>

      <div class="toolbar">
        <div class="lang-group">
          <button class="lang-btn active">ES</button>
          <button class="lang-btn">PT</button>
        </div>
        <button class="motion-btn" title="Pausar movimento">⏸</button>
      </div>

      <div class="features-container">
        <div class="feature-hotspot">
          <div class="feature-tooltip">Cultivo controlado de tomate e pimentão de alto padrão</div>
        </div>
        <div class="feature-hotspot">
          <div class="feature-tooltip">Solução nutritiva recirculante com máxima economia hídrica</div>
        </div>
        <div class="feature-hotspot">
          <div class="feature-tooltip">Telemetria em tempo real: pH, Condutividade Elétrica e VPD</div>
        </div>
        <div class="feature-hotspot">
          <div class="feature-tooltip">Boas Práticas Agrícolas (BPA) e certificação sustentável SENAVE</div>
        </div>
      </div>

      <div class="enter-wrapper">
        <div class="roles-popover">
          <button class="role-chip" id="chip-prod">🌾 Modo Produtor (Don Mateo IA)</button>
          <button class="role-chip" id="chip-admin">📊 Painel Administrativo</button>
        </div>
        <button class="enter-btn-main">
          <span>ENTRAR AL SISTEMA</span>
          <span>→</span>
        </button>
      </div>
    </div>
  </body>
  </html>
`);

await page.waitForFunction(() => document.querySelector('video')?.readyState >= 2);
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/prototype-default.png' });

// Hover over enter wrapper
await page.hover('.enter-wrapper');
await new Promise(r => setTimeout(r, 350));
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/prototype-hover-enter.png' });

// Hover over feature hotspot
await page.hover('.features-container .feature-hotspot:nth-child(3)');
await new Promise(r => setTimeout(r, 350));
await page.screenshot({ path: 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa/prototype-hover-feature.png' });

await browser.close();
console.log('Saved prototype screenshots');
