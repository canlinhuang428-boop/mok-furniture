import admin from "firebase-admin";
import { readFileSync } from "fs";
const serviceAccount = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 分类数据
const categories = [
  { id: "cabinet", name_th: "ตู้เอกสาร", sort: 1 },
  { id: "bed", name_th: "เตียงเหล็ก", sort: 2 },
  { id: "shelf", name_th: "ชั้นวาง", sort: 3 },
  { id: "table", name_th: "โต๊ะ", sort: 4 },
];

// 产品数据
const products = [
  {
    id: "Y06A",
    name_th: "ตู้เอกสารเหล็ก 2 บานเปิด",
    name_en: "Steel Cabinet Y06A",
    category: "cabinet",
    sku: "Y06A",
    size: "85x39x180 cm",
    price: 2890,
    original_price: 3290,
    image: "https://placehold.co/600x400?text=Y06A",
    status: true,
    sort: 1,
    tags: ["พร้อมส่ง", "เก็บเงินปลายทาง"],
  },
  {
    id: "Y08B",
    name_th: "ตู้เอกสารเหล็ก 4 บานเปิด",
    name_en: "Steel Cabinet Y08B",
    category: "cabinet",
    sku: "Y08B",
    size: "120x45x180 cm",
    price: 4590,
    original_price: 5290,
    image: "https://placehold.co/600x400?text=Y08B",
    status: true,
    sort: 2,
    tags: ["พร้อมส่ง"],
  },
  {
    id: "B01A",
    name_th: "เตียงเหล็ก 3.5 ฟุต",
    name_en: "Steel Bed B01A",
    category: "bed",
    sku: "B01A",
    size: "110x190x80 cm",
    price: 3990,
    original_price: 4990,
    image: "https://placehold.co/600x400?text=B01A",
    status: true,
    sort: 1,
    tags: ["พร้อมส่ง", "เก็บเงินปลายทาง"],
  },
  {
    id: "B02A",
    name_th: "เตียงเหล็ก 5 ฟุต",
    name_en: "Steel Bed B02A",
    category: "bed",
    sku: "B02A",
    size: "152x190x80 cm",
    price: 4990,
    original_price: 5990,
    image: "https://placehold.co/600x400?text=B02A",
    status: true,
    sort: 2,
    tags: ["พร้อมส่ง"],
  },
  {
    id: "S01A",
    name_th: "ชั้นวางเหล็ก 4 ชั้น",
    name_en: "Steel Shelf S01A",
    category: "shelf",
    sku: "S01A",
    size: "60x30x150 cm",
    price: 1290,
    original_price: 1590,
    image: "https://placehold.co/600x400?text=S01A",
    status: true,
    sort: 1,
    tags: ["พร้อมส่ง", "ประหยัด"],
  },
  {
    id: "T01A",
    name_th: "โต๊ะเหล็กพับได้",
    name_en: "Folding Steel Table T01A",
    category: "table",
    sku: "T01A",
    size: "60x60x75 cm",
    price: 890,
    original_price: 1190,
    image: "https://placehold.co/600x400?text=T01A",
    status: true,
    sort: 1,
    tags: ["พร้อมส่ง"],
  },
];

async function seed() {
  console.log("🚀 开始写入 Firestore 数据...\n");

  // 写入分类
  console.log("📁 写入 categories...");
  for (const cat of categories) {
    await db.collection("categories").doc(cat.id).set(cat);
    console.log(`  ✅ ${cat.id} - ${cat.name_th}`);
  }

  // 写入产品
  console.log("\n📦 写入 products...");
  for (const prod of products) {
    await db.collection("products").doc(prod.id).set(prod);
    console.log(`  ✅ ${prod.id} - ${prod.name_th}`);
  }

  console.log("\n✅ 全部写入完成！共写入：");
  console.log(`  - ${categories.length} 个分类`);
  console.log(`  - ${products.length} 个产品`);
}

seed().catch(console.error);
