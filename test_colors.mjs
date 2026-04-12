import { chromium } from "playwright";
import { writeFileSync } from "fs";

const browser = await chromium.launch();
const page = await browser.newPage();
page.setViewportSize({ width: 1280, height: 900 });

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);

// Save a screenshot to workspace
await page.screenshot({ path: "/Users/huangcanlin/.openclaw/workspace/mok_site.png", fullPage: false });
console.log("Screenshot saved");

// Check each image element's data URL representation
const imgData = await page.evaluate(() => {
  const results = [];
  const imgs = document.querySelectorAll('img');
  imgs.forEach((img, i) => {
    if (img.src.includes('storage.googleapis.com')) {
      results.push({
        index: i,
        src: img.src.substring(0, 60),
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
        complete: img.complete,
        offsetW: img.offsetWidth,
        offsetH: img.offsetHeight,
        renderedW: img.getBoundingClientRect().width
      });
    }
  });
  return results;
});

console.log("\nStorage image elements:");
imgData.forEach(d => console.log(JSON.stringify(d)));

await browser.close();
