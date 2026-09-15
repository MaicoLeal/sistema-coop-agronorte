import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const baseUrl = 'http://127.0.0.1:3000/?qa=chrome';
const output = 'C:/Users/Coop Agronorte/AppData/Local/Temp/agronorte-landing-qa';
const fs = await import('node:fs/promises');
await fs.mkdir(output, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
});

const results = { desktop: {}, mobile: {}, errors: [] };

async function attachDiagnostics(page) {
  page.on('console', (message) => {
    if (message.type() === 'error') results.errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => results.errors.push(`page: ${error.message}`));
  page.on('requestfailed', (request) => results.errors.push(`request: ${request.url()} ${request.failure()?.errorText}`));
}

try {
  const page = await browser.newPage();
  await attachDiagnostics(page);
  await page.setViewport({ width: 1440, height: 810, deviceScaleFactor: 1 });
  await page.goto(baseUrl, { waitUntil: 'networkidle2' });
  await page.waitForFunction(() => {
    const video = document.querySelector('video');
    return video && video.readyState >= 2 && video.currentTime > 0;
  }, { timeout: 15_000 });

  results.desktop.video = await page.$eval('video', (video) => ({
    readyState: video.readyState,
    paused: video.paused,
    currentTime: video.currentTime,
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight,
    opacity: getComputedStyle(video).opacity,
  }));

  await page.waitForFunction(() => Number.parseFloat(getComputedStyle(document.querySelector('video')).opacity) >= 0.99);
  await page.screenshot({ path: `${output}/desktop-default.png` });
  await page.hover('[data-feature="telemetry"]');
  await new Promise((resolve) => setTimeout(resolve, 250));
  results.desktop.hover = await page.$eval('[data-feature="telemetry"]', (button) => ({
    transform: getComputedStyle(button).transform,
    boxShadow: getComputedStyle(button).boxShadow,
    pressed: button.getAttribute('aria-pressed'),
  }));
  await page.screenshot({ path: `${output}/desktop-hover.png` });

  await page.click('.reference-motion');
  await page.waitForFunction(() => document.querySelector('video')?.paused === true);
  results.desktop.pausedByControl = await page.$eval('video', (video) => video.paused);

  await page.click('[data-access="producer"]');
  await page.waitForFunction(() => !document.querySelector('.reference-landing'));
  results.desktop.producerNavigation = {
    landingClosed: await page.$('.reference-landing') === null,
    appShellVisible: await page.$('[class*="lg:pl-72"]') !== null,
    correctSurface: (await page.$eval('body', (body) => body.innerText)).includes('Panel del Productor'),
    textSample: (await page.$eval('body', (body) => body.innerText)).slice(0, 180),
  };

  const adminPage = await browser.newPage();
  await attachDiagnostics(adminPage);
  await adminPage.setViewport({ width: 1440, height: 810, deviceScaleFactor: 1 });
  await adminPage.goto(baseUrl, { waitUntil: 'networkidle2' });
  await adminPage.click('[data-access="administration"]');
  await adminPage.waitForFunction(() => !document.querySelector('.reference-landing'));
  results.desktop.adminNavigation = {
    landingClosed: await adminPage.$('.reference-landing') === null,
    appShellVisible: await adminPage.$('[class*="lg:pl-72"]') !== null,
    correctSurface: (await adminPage.$eval('body', (body) => body.innerText)).includes('Painel Central de Manejo Hidropônico'),
    textSample: (await adminPage.$eval('body', (body) => body.innerText)).slice(0, 180),
  };
  await adminPage.close();

  const mobile = await browser.newPage();
  await attachDiagnostics(mobile);
  await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await mobile.goto(`${baseUrl}&mobile=1`, { waitUntil: 'networkidle2' });
  await mobile.waitForSelector('[data-access="producer"]');
  results.mobile.buttons = await mobile.$$eval('[data-access]', (buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return {
      access: button.getAttribute('data-access'),
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      inViewport: rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight,
    };
  }));
  results.mobile.featuresHidden = await mobile.$eval('.reference-features', (el) => getComputedStyle(el).display === 'none');
  await mobile.screenshot({ path: `${output}/mobile.png` });
  await mobile.close();

  console.log(JSON.stringify({ ...results, screenshots: output }, null, 2));
} finally {
  await browser.close();
}
