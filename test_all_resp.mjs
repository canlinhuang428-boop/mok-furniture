import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });

// Just log ALL responses for a bit
let count = 0;
page.on("response", res => {
  const url = res.url();
  if (url.match(/storage|product|logo/) && count < 20) {
    console.log(`  [${res.status()}] ${url.substring(0, 90)}`);
    count++;
  }
});

await page.waitForTimeout(3000);

// Check if images have any usable data
const imgInfo = await page.$$eval("img", imgs => 
  imgs.filter(i => i.naturalWidth === 0).map(i => ({ src: i.src, complete: i.complete, offsetWidth: i.offsetWidth }))
);
console.log("\nBroken images:", imgInfo);

await browser.close();
