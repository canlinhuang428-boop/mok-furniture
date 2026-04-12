import { chromium } from "playwright";
import { writeFileSync } from "fs";

const browser = await chromium.launch({ args: ["--disable-web-security"] });
const page = await browser.newPage();
page.setViewportSize({ width: 1440, height: 900 });

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(6000);

// Save screenshot
await page.screenshot({ path: "/Users/huangcanlin/.openclaw/workspace/mok_check.png", fullPage: true, timeout: 10000 });
console.log("Saved full-page screenshot");

// Try to read actual image data
const storageImgs = await page.evaluate(() => {
  const results = [];
  const imgs = Array.from(document.querySelectorAll("img")).filter(img => img.src.includes("storage.googleapis"));
  for (const img of imgs) {
    // Check if the image has actual data
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 10;
    canvas.height = img.naturalHeight || 10;
    const ctx = canvas.getContext("2d");
    try {
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      results.push({
        src: img.src.substring(50, 75),
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
        firstPixel: Array.from(data),
        renderedSize: `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}`
      });
    } catch(e) {
      results.push({
        src: img.src.substring(50, 75),
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
        error: e.message,
        renderedSize: `${Math.round(img.getBoundingClientRect().width)}x${Math.round(img.getBoundingClientRect().height)}`
      });
    }
  }
  return results;
});

console.log("\nStorage image data:");
storageImgs.forEach(s => {
  if (s.error) console.log(`  ❌ ERROR: ${s.error} (rendered: ${s.renderedSize})`);
  else console.log(`  ${s.naturalW > 0 ? '✅' : '❌'} natural=${s.naturalW}x${s.naturalH} rendered=${s.renderedSize} firstPixel=${s.firstPixel} src=...${s.src}`);
});

await browser.close();
