import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
page.setViewportSize({ width: 1280, height: 900 });

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(4000);

// Check all images with their dimensions and rendered state
const imgInfo = await page.$$eval("img", imgs => imgs.map(img => ({
  src: img.src.substring(0, 70),
  rendered: img.getBoundingClientRect().width > 0,
  w: img.naturalWidth,
  h: img.naturalHeight,
  offsetW: Math.round(img.getBoundingClientRect().width),
  complete: img.complete
})));

console.log("All images on page:");
imgInfo.forEach(i => {
  const status = i.rendered && i.w > 0 ? '✅' : '❌';
  console.log(`  ${status} [${i.offsetW}px] ${i.w}x${i.h} complete=${i.complete} ${i.src}`);
});

await browser.close();
