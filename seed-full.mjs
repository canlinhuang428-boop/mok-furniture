import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const categories = [
  { id: "cat_cabinet", name_th: "ตู้เอกสาร", name_en: "Filing Cabinet", name_zh: "文件柜", sort: 1 },
  { id: "cat_rack", name_th: "ชั้นวางของ", name_en: "Racks", name_zh: "货架", sort: 2 },
  { id: "cat_mirror", name_th: "กระจก", name_en: "Mirrors", name_zh: "镜子", sort: 3 },
  { id: "cat_wardrobe", name_th: "ตู้เสื้อผ้า", name_en: "Wardrobe", name_zh: "衣柜", sort: 4 },
  { id: "cat_storage", name_th: "ตู้เก็บของ", name_en: "Storage", name_zh: "橱柜", sort: 5 },
];

const products = [
  { id: "p1", category_id: "cat_cabinet", name_th: "ตู้เอกสารเหล็ก 2 บานเปิด รุ่น Y06A", name_en: "Steel Filing Cabinet 2 Doors Y06A", name_zh: "铁皮双门文件柜 Y06A", sku: "Y06A", size: "85x39x180 cm", images: ["https://placehold.co/600x600/e2e8f0/475569?text=Cabinet+Y06A"], tags_th: ["สินค้าขายดี"], tags_en: ["Best Seller"], tags_zh: ["畅销款"], featured: true, stock_status: "in_stock" },
  { id: "p2", category_id: "cat_wardrobe", name_th: "ตู้เสื้อผ้าอเนกประสงค์ รุ่น ZH14", name_en: "Multi-purpose Wardrobe ZH14", name_zh: "多功能组合衣柜 ZH14", sku: "ZH14", size: "120x50x200 cm", images: ["https://placehold.co/600x600/fed7aa/ea580c?text=Wardrobe+ZH14"], tags_th: ["สินค้าแนะนำ"], tags_en: ["Recommended"], tags_zh: ["掌柜推荐"], featured: true, stock_status: "in_stock" },
  { id: "p4", category_id: "cat_mirror", name_th: "กระจกเงาเต็มตัว ทรงโค้งมินิมอล", name_en: "Full Length Arch Mirror", name_zh: "极简弧顶全身镜", sku: "MR-CURVE-01", size: "60x160 cm", images: ["https://placehold.co/600x800/fecaca/dc2626?text=Standing+Mirror"], tags_th: ["ยอดฮิต"], tags_en: ["Popular"], tags_zh: ["爆款"], featured: true, stock_status: "in_stock" },
  { id: "p5", category_id: "cat_cabinet", name_th: "ตู้เอกสารเหล็ก 4 บานเปิด รุ่น Y08B", name_en: "Steel Filing Cabinet 4 Doors Y08B", name_zh: "铁皮四门文件柜 Y08B", sku: "Y08B", size: "120x45x180 cm", images: ["https://placehold.co/600x600/e2e8f0/475569?text=Cabinet+Y08B"], tags_th: ["สินค้าขายดี"], tags_en: ["Best Seller"], tags_zh: ["畅销款"], featured: false, stock_status: "in_stock" },
  { id: "p6", category_id: "cat_rack", name_th: "ชั้นวางเหล็ก 4 ชั้น รุ่น S01A", name_en: "Steel Shelf 4-Tier S01A", name_zh: "四层铁货架 S01A", sku: "S01A", size: "60x30x150 cm", images: ["https://placehold.co/600x600/dcfce7/16a34a?text=Shelf+S01A"], tags_th: ["พร้อมส่ง"], tags_en: ["In Stock"], tags_zh: ["有货"], featured: false, stock_status: "in_stock" },
  { id: "p7", category_id: "cat_storage", name_th: "ตู้เก็บของพลาสติก ฝาฝาใส 6 ลิตร", name_en: "Plastic Storage Box 6L", name_zh: "塑料收纳箱 6L", sku: "ST-6L-01", size: "30x20x15 cm", images: ["https://placehold.co/600x600/bfdbfe/3b82f6?text=Storage+6L"], tags_th: ["พร้อมส่ง"], tags_en: ["In Stock"], tags_zh: ["有货"], featured: false, stock_status: "in_stock" },
];

async function seed() {
  console.log("🚀 Writing Firestore data...\n");
  console.log("📁 Writing categories...");
  for (const c of categories) {
    await db.collection("categories").doc(c.id).set(c);
    console.log(`  ✅ ${c.id} - ${c.name_th}`);
  }
  console.log("\n📦 Writing products...");
  for (const p of products) {
    await db.collection("products").doc(p.id).set(p);
    console.log(`  ✅ ${p.id} - ${p.name_th}`);
  }
  console.log(`\n✅ Done! ${categories.length} categories, ${products.length} products`);
}

seed().catch(e => { console.error(e); process.exit(1); });
