import aws4 from "aws4";
import { readFileSync } from "fs";

const ACCOUNT_ID = "6fec257ce1fa5321a4fa21e2d8e87438";
const ACCESS_KEY = "e7c99202612edb507480d5df24c93116";
const SECRET_KEY = "7cbfdea6356b26c02d23ce250602b21cf00665e8ef5c7d48b61cfd78b79f67ba";
const BUCKET = "mok-images";
const HOST = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BASE = `https://${HOST}`;

const creds = { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY };

async function r2Put(key, body, contentType) {
  const path = `/${BUCKET}/${key}`;
  const opts = {
    host: HOST,
    path,
    service: "s3",
    region: "auto",
    method: "PUT",
    headers: {
      "Content-Type": contentType || "application/octet-stream",
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
      "content-length": String(body.length),
    },
  };
  aws4.sign(opts, creds);
  
  const resp = await fetch(`${BASE}${path}`, { method: "PUT", headers: opts.headers, body });
  const text = await resp.text();
  return { status: resp.status, body: text };
}

async function r2Get(key) {
  const path = `/${BUCKET}/${key}`;
  const opts = {
    host: HOST,
    path,
    service: "s3",
    region: "auto",
    method: "GET",
    headers: { "x-amz-content-sha256": "UNSIGNED-PAYLOAD" },
  };
  aws4.sign(opts, creds);
  
  const resp = await fetch(`${BASE}${path}`, { method: "GET", headers: opts.headers });
  const text = await resp.text();
  return { status: resp.status, body: text };
}

async function main() {
  // Test 1: PutObject to mok-images bucket
  console.log("=== Test: PutObject to mok-images/test.txt ===");
  const r = await r2Put("test.txt", Buffer.from("R2 upload works! 🎉"), "text/plain");
  console.log(`Status: ${r.status}`);
  console.log(`Body: ${r.body.substring(0, 200)}`);
  
  if (r.status === 200 || r.status === 201) {
    console.log("\n✅ PUT works! Testing GET...");
    const get = await r2Get("test.txt");
    console.log(`GET Status: ${get.status}`);
    console.log(`GET Body: ${get.body.substring(0, 100)}`);
    
    if (get.status === 200) {
      console.log("\n🎉 R2 is fully working! Starting real uploads...");
      
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
      
      for (const { local, key } of imageFiles) {
        const body = readFileSync(local);
        process.stdout.write(`Uploading ${key}... `);
        const res = await r2Put(key, body, "image/jpeg");
        if (res.status === 200 || res.status === 201) {
          console.log(`✅`);
        } else {
          console.log(`❌ ${res.status}: ${res.body.substring(0, 80)}`);
        }
      }
      
      console.log("\n✅ All uploads done!");
    }
  }
}

main().catch(console.error);
