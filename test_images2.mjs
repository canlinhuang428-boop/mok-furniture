import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

const allResponses = [];
page.on("response", res => {
  const url = res.url();
  if (url.includes("storage") || url.includes("firebase")) {
    allResponses.push({ status: res.status(), statusText: res.statusText(), url: url.substring(0, 80) });
  }
});

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);

console.log("All storage responses:", JSON.stringify(allResponses, null, 2));

await browser.close();
