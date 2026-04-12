import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--disable-web-security"] });
const page = await browser.newPage();

const allStorage = [];
page.on("response", res => {
  const url = res.url();
  if (url.includes("googles") || url.includes("placehold")) {
    allStorage.push({ status: res.status(), url: url.substring(0, 90) });
  }
});

const imgErrors = [];
page.on("requestfailed", req => {
  imgErrors.push({ url: req.url().substring(0, 90), failure: req.failure()?.errorText });
});

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);

console.log("Storage responses:");
allStorage.forEach(s => console.log(`  ${s.status} ${s.url}`));

console.log("\nFailed requests:");
imgErrors.forEach(e => console.log(`  ❌ ${e.url}: ${e.failure}`));

const imgs = await page.$$eval("img", imgs => imgs.slice(0, 8).map(img => ({
  src: img.src.substring(0, 80),
  w: img.naturalWidth,
  h: img.naturalHeight,
  complete: img.complete
})));
console.log("\nImage elements:");
imgs.forEach(i => console.log(`  ${i.w > 0 ? '✅' : '❌'} ${i.complete ? 'loaded' : 'NOT loaded'} ${i.w}x${i.h} ${i.src}`));

await browser.close();
