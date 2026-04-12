import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("response", res => {
  console.log(`  [${res.status()}] ${res.url().substring(0, 80)}`);
});

page.on("requestfailed", req => {
  console.log(`  FAILED: ${req.url().substring(0, 80)} - ${req.failure()?.errorText}`);
});

await page.goto("https://storage.googleapis.com/th-mok.firebasestorage.app/products/Y06A_1.jpg", { timeout: 10000 });
await page.waitForTimeout(2000);
console.log("Title:", await page.title());
const bodyContent = await page.$eval("body", el => el.innerHTML.substring(0, 100));
console.log("Body:", bodyContent);

await browser.close();
