import puppeteer from 'puppeteer-core';

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
});

const page = await browser.newPage();
const result = await page.evaluate(async () => {
  const loadImg = (src) => new Promise((res) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.src = src;
  });

  const imgRef = await loadImg('http://127.0.0.1:3000/assets/agronorte-reference-hero.jpg');
  
  const video = document.createElement('video');
  video.src = 'http://127.0.0.1:3000/assets/agronorte-home.mp4';
  video.muted = true;
  await new Promise(r => { video.onloadeddata = r; });
  video.currentTime = 1.0;
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

  // Let's find the center of the green compass circle:
  // Green color is around rgb(104, 186, 69) or rgb(110, 190, 70).
  // Let's find the bounding box of the compass in both:
  // In Ref: search x in [600, 1200], y in [50, 400]
  // In Vid: search x in [600, 1600], y in [50, 600]
  function findCompassBBox(ctx, w, h, xmin, xmax, ymin, ymax) {
    const data = ctx.getImageData(xmin, ymin, xmax - xmin, ymax - ymin).data;
    let minX = 99999, maxX = -1, minY = 99999, maxY = -1;
    for (let y = ymin; y < ymax; y++) {
      for (let x = xmin; x < xmax; x++) {
        const idx = ((y - ymin) * (xmax - xmin) + (x - xmin)) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        // Green compass color: strong green, r < 140, g > 150, b < 100
        if (g > 150 && r < 140 && b < 100 && (g - r) > 40 && (g - b) > 60) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return { minX, maxX, minY, maxY, cx: (minX + maxX)/2, cy: (minY + maxY)/2, w: maxX - minX, h: maxY - minY };
  }

  const boxRef = findCompassBBox(ctxRef, imgRef.width, imgRef.height, 600, 1200, 50, 400);
  const boxVid = findCompassBBox(ctxVid, video.videoWidth, video.videoHeight, 600, 1600, 50, 600);

  // Flag position: red stripe in flag
  // In Ref: search x in [1000, 1600], y in [200, 500]
  function findFlagRed(ctx, xmin, xmax, ymin, ymax) {
    const data = ctx.getImageData(xmin, ymin, xmax - xmin, ymax - ymin).data;
    let minX = 99999, maxX = -1, minY = 99999, maxY = -1;
    for (let y = ymin; y < ymax; y++) {
      for (let x = xmin; x < xmax; x++) {
        const idx = ((y - ymin) * (xmax - xmin) + (x - xmin)) * 4;
        const r = data[idx], g = data[idx+1], b = data[idx+2];
        // Red flag color: r > 180, g < 60, b < 60
        if (r > 180 && g < 70 && b < 70) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    return { cx: (minX + maxX)/2, cy: (minY + maxY)/2, w: maxX - minX, h: maxY - minY };
  }

  const flagRef = findFlagRed(ctxRef, 1100, 1600, 200, 500);
  const flagVid = findFlagRed(ctxVid, 1600, 2200, 300, 700);

  return { boxRef, boxVid, flagRef, flagVid, refSize: { w: imgRef.width, h: imgRef.height }, vidSize: { w: video.videoWidth, h: video.videoHeight } };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
