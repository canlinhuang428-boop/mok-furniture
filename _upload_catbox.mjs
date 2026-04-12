import { readFileSync, writeFileSync } from "fs";

const imageFiles = [
  { local: "product-images/Y06A_1.jpg", key: "products/Y06A_1.jpg" },
  { local: "product-images/Y06A_2.jpg", key: "products/Y06A_2.jpg" },
  { local: "product-images/Y06A_3.jpg", key: "products/Y06A_3.jpg" },
  { local: "product-images/Y06A_4.jpg", key: "products/Y06A_4.jpg" },
  { local: "product-images/Y08B_1.jpg", key: "products/Y08B_1.jpg" },
  { local: "product-images/Y08B_2.jpg", key: "products/Y08B_2.jpg" },
  { local: "product-images/MR01_1.jpg", key: "products/MR01_1.jpg" },
  { local: "product-images/MR01_2.jpg", key: "products/MR01_2.jpg" },
  { local: "product-images/MR01_3.jpg", key: "products/MR01_3.jpg" },
  { local: "product-images/logo.jpg", key: "products/logo.jpg" },
];

const uploaded = {};

for (const { local, key } of imageFiles) {
  const body = readFileSync(local);
  const form = new FormData();
  form.append("reqtype", "fileupload");
  form.append("time", "72h");
  form.append("fileToUpload", new Blob([body]), local.split("/").pop());

  try {
    const resp = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: form,
    });
    const text = await resp.text();
    const url = text.trim();
    if (url.startsWith("https://")) {
      console.log(`✅ ${key} → ${url}`);
      uploaded[key] = url;
    } else {
      console.log(`❌ ${key} → Catbox error: ${text.substring(0, 100)}`);
    }
  } catch(e) {
    console.log(`❌ ${key} → Network error: ${e.message}`);
  }
}

writeFileSync("catbox_uploaded.json", JSON.stringify(uploaded, null, 2));
console.log("\nResults saved to catbox_uploaded.json");
console.log("Total uploaded:", Object.keys(uploaded).length);
