import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);

// Get all images on the page
const allImgs = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("img")).map(img => ({
    src: img.src,
    complete: img.complete,
    w: img.naturalWidth,
    h: img.naturalHeight,
    tag: img.outerHTML.substring(0, 100)
  }));
});

console.log(`Total images: ${allImgs.length}`);
allImgs.forEach((img, i) => {
  const status = img.w > 0 ? '✅' : '❌';
  console.log(`  ${i} ${status} [${img.w}x${img.h}] ${img.src.substring(0, 80)}`);
});

await browser.close();
