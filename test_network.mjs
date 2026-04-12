import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

const responses = [];
page.on("response", res => {
  const url = res.url();
  if (url.includes("storage") || url.includes("firebase")) {
    responses.push({
      url: url.substring(0, 100),
      status: res.status(),
      ct: res.headers()["content-type"] || ""
    });
  }
});

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(4000);

console.log("Storage responses captured:", responses.length);
responses.forEach(r => console.log(`  ${r.status} ct=${r.ct.substring(0,30)} ${r.url}`));

await browser.close();
