import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

// Intercept requests and log them
page.on("request", req => {
  const url = req.url();
  if (url.includes("storage") || url.includes("firebase")) {
    console.log(`REQ: ${req.method()} ${url.substring(0, 100)}`);
  }
});

page.on("requestfailed", req => {
  const url = req.url();
  if (url.includes("storage") || url.includes("firebase")) {
    console.log(`FAIL: ${req.failure()?.errorText} - ${url.substring(0, 80)}`);
  }
});

page.on("response", res => {
  const url = res.url();
  if (url.includes("storage") || url.includes("firebase")) {
    console.log(`RESP: ${res.status()} ${url.substring(0, 80)}`);
  }
});

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);

await browser.close();
