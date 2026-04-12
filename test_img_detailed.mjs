import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(3000);

// Intercept ALL responses to see what's happening with storage
const storageResponses = [];
page.on("response", async res => {
  const url = res.url();
  if (url.includes("products")) {
    storageResponses.push({ url: url.substring(0, 90), status: res.status() });
    // Try to read content
    try {
      const buffer = await res.body();
      console.log(`  Response for ${url.substring(50,80)}: ${res.status()}, body length: ${buffer?.length || 'N/A'}`);
    } catch(e) {}
  }
});

await page.waitForTimeout(2000);
console.log("Storage responses captured:", storageResponses.length);

await browser.close();
