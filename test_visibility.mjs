import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
page.setViewportSize({ width: 1280, height: 900 });

await page.goto("https://mok-furniture-three.vercel.app", { waitUntil: "domcontentloaded", timeout: 20000 });
await page.waitForTimeout(5000);

// Take screenshot focusing on product cards area
await page.screenshot({ path: "/tmp/mok_screenshot.png", fullPage: false });
console.log("Screenshot saved to /tmp/mok_screenshot.png");

// Get bounding boxes of broken images
const broken = await page.$$eval("img", imgs => 
  imgs.filter(i => i.naturalWidth === 0 && i.complete).map(i => {
    const rect = i.getBoundingClientRect();
    return { src: i.src.substring(50), w: Math.round(rect.width), h: Math.round(rect.height), visible: rect.width > 0 };
  })
);

console.log("\nImages with naturalWidth=0 but complete=true:");
broken.forEach(b => console.log(`  ${b.visible ? '✅ visible' : '❌ hidden'} ${b.w}x${b.h} - ${b.src}`));

await browser.close();
