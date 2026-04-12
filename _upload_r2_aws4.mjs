import aws4 from "aws4";
import { readFileSync, writeFileSync } from "fs";

const ACCOUNT_ID = "6fec257ce1fa5321a4fa21e2d8e87438";
const ACCESS_KEY = "e7c99202612edb507480d5df24c93116";
const SECRET_KEY = "7cbfdea6356b26c02d23ce250602b21cf00665e8ef5c7d48b61cfd78b79f67ba";
const BUCKET = "mok-images";
const HOST = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BASE = `https://${HOST}`;

const creds = { accessKey: ACCESS_KEY, secretKey: SECRET_KEY };

function r2sign(opts) {
  aws4.sign(opts, { ...creds, service: "s3", region: "auto" });
}

async function r2fetch(method, path, body, contentType) {
  const headers = { "x-amz-content-sha256": "UNSIGNED-PAYLOAD" };
  if (contentType) headers["Content-Type"] = contentType;
  if (body) headers["content-length"] = String(body.length);
  
  const fullPath = path.startsWith("/") ? path : `/${BUCKET}${path}`;
  const opts = { host: HOST, path: fullPath, method, headers };
  r2sign(opts);
  
  const resp = await fetch(`${BASE}${fullPath}`, { method, headers: opts.headers, body });
  const text = await resp.text();
  return { status: resp.status, body: text };
}

async function main() {
  console.log("=== R2 Connection Test with aws4 ===");
  
  // Test ListBuckets (path: /)
  console.log("\n1. GET /");
  const list = await r2fetch("GET", "/");
  console.log(`   Status: ${list.status}`);
  console.log(`   Body: ${list.body.substring(0, 200)}`);
  
  if (list.status === 200) {
    console.log("\n✅ Connected! Uploading images...");
    
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
      const r = await r2fetch("PUT", `/${BUCKET}/${key}`, body, "image/jpeg");
      if (r.status === 200 || r.status === 201) {
        const url = `https://pub-${ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
        console.log(`   ✅ ${key}`);
        uploaded[key] = url;
      } else {
        console.log(`   ❌ ${key}: ${r.status} ${r.body.substring(0, 100)}`);
      }
    }
    
    writeFileSync("r2_uploaded.json", JSON.stringify(uploaded, null, 2));
    console.log("\n✅ Done! Results in r2_uploaded.json");
    console.log("\nUploaded URLs:");
    Object.entries(uploaded).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  } else {
    console.log("\n❌ Connection failed. Check credentials.");
  }
}

main().catch(console.error);
