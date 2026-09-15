import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
await page.setContent(`
  <canvas id="c"></canvas>
`);

const match = await page.evaluate(async () => {
  const loadImg = (src) => new Promise((res) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.src = src;
  });

  const imgRef = await loadImg('http://127.0.0.1:3000/assets/agronorte-reference-hero.jpg');
  
  // Let's create a video element and grab a frame
  const video = document.createElement('video');
  video.src = 'http://127.0.0.1:3000/assets/agronorte-home.mp4';
  video.muted = true;
  await new Promise(r => { video.onloadeddata = r; });
  video.currentTime = 0.5;
  await new Promise(r => { video.onseeked = r; });

  const cRef = document.createElement('canvas');
  cRef.width = imgRef.width;
  cRef.height = imgRef.height;
  const ctxRef = cRef.getContext('2d');
  ctxRef.drawImage(imgRef, 0, 0);

  const cVid = document.createElement('canvas');
  cVid.width = video.videoWidth;
  cVid.height = video.videoHeight;
  const ctxVid = cVid.getContext('2d');
  ctxVid.drawImage(video, 0, 0);

  // Sample a unique point: e.g. the flag pole tip or the green compass arrow tip in the logo
  // Let's find scale:
  // In imgRef (2752 x 1536), let's find the green compass arrow center:
  // In video (3840 x 2160), let's find the same.
  return {
    refSize: { w: imgRef.width, h: imgRef.height },
    vidSize: { w: video.videoWidth, h: video.videoHeight },
  };
});

console.log(match);
await browser.close();
