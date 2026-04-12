import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

const errors = [];
const failed = [];
const imgStatuses = [];

page.on("console", msg => {
  if (msg.type() === "error") errors.push(msg.text());
});

page.on("response", res => {
  const url = res.url();
  if (url.includes("storage.googleapis") || url.includes("firebasestorage")) {
    imgStatuses.push({ status: res.status(), url: url.substring(0, 80) });
  }
});

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);

const imgs = await page.$$eval("img", imgs => imgs.slice(0, 8).map(img => ({
  src: img.src,
  w: img.naturalWidth,
  complete: img.complete
})));
console.log("Images on page:");
imgs.forEach(i => console.log(`  ${i.w === 0 ? '❌ BROKEN' : '✅ OK'} ${i.src.substring(0, 90)}`));

console.log("\nStorage responses:");
imgStatuses.forEach(s => console.log(`  ${s.status} ${s.url}`));

if (errors.length) console.log("\nConsole errors:", errors.slice(0, 5));

await browser.close();
