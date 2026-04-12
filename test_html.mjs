import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);

// Get HTML of first product card image to see exact src attribute
const firstProdImg = await page.evaluate(() => {
  const cards = document.querySelectorAll(".bg-white.rounded-xl");
  for (const card of cards) {
    const img = card.querySelector("img");
    if (img) {
      return {
        src: img.src,
        outerHTML: img.outerHTML.substring(0, 200),
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      };
    }
  }
  return null;
});

console.log("First product card image:", JSON.stringify(firstProdImg, null, 2));

// Also check the logo
const logoImg = await page.evaluate(() => {
  const imgs = document.querySelectorAll("img");
  for (const img of imgs) {
    if (img.src.includes("logo")) {
      return { src: img.src, complete: img.complete, w: img.naturalWidth, h: img.naturalHeight };
    }
  }
  return null;
});
console.log("Logo:", JSON.stringify(logoImg));

await browser.close();
