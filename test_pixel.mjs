import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
page.setViewportSize({ width: 1280, height: 900 });

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);

// Get the bounding boxes of images and check if they have non-white pixels
const imgBoxes = await page.$$eval("img", imgs => 
  imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => {
    const rect = i.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height), src: i.src.substring(0,60) };
  })
);

console.log("Images with naturalWidth=0:", imgBoxes.length);

// For each broken image, check a few pixel colors
for (const box of imgBoxes.slice(0, 3)) {
  if (box.w > 0 && box.h > 0) {
    const pixel = await page.evaluate(({ x, y, w, h }) => {
      // Get center pixel
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      // We can't easily get pixels from img without drawing it
      return { x, y, w, h, centerPixel: `(${w/2}, ${h/2})` };
    }, box);
    console.log(`  Box: ${box.x},${box.y} ${box.w}x${box.h} - ${box.src}`);
  }
}

// Try to get computed background color of the image container
const containerBg = await page.evaluate(() => {
  const imgs = document.querySelectorAll('img');
  let count = 0;
  imgs.forEach(i => {
    if (i.naturalWidth === 0 && i.complete) {
      const bg = window.getComputedStyle(i.parentElement).backgroundColor;
      console.log(`Image ${count++}: bg=${bg}`);
    }
  });
});

await browser.close();
