import aws4 from "aws4";
import { readFileSync, writeFileSync } from "fs";

const ACCOUNT_ID = "6fec257ce1fa5321a4fa21e2d8e87438";
const ACCESS_KEY = "969384a0287853edc8ec348d7e1ea019";
const SECRET_KEY = "0576c20d70ea4992e9c9ef148e7e91315818e49fcce1dd635ac1bd927b7f4b5e";
const BUCKET = "mok-images";
const HOST = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BASE = `https://${HOST}`;
const creds = { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY };

async function r2(method, path, body, ct) {
  const headers = { "x-amz-content-sha256": "UNSIGNED-PAYLOAD", host: HOST };
  if (ct) headers["Content-Type"] = ct;
  if (body) headers["content-length"] = String(body.length);
  const opts = { host: HOST, path: `/${BUCKET}${path}`, service: "s3", region: "auto", method, headers };
  aws4.sign(opts, creds);
  const resp = await fetch(`${BASE}/${BUCKET}${path}`, { method, headers: opts.headers, body });
  return { status: resp.status, body: await resp.text() };
}

const imageFiles = [
  { local: "product-images/Y06A_1.jpg", key: "/products/Y06A_1.jpg" },
  { local: "product-images/Y06A_2.jpg", key: "/products/Y06A_2.jpg" },
  { local: "product-images/Y06A_3.jpg", key: "/products/Y06A_3.jpg" },
  { local: "product-images/Y06A_4.jpg", key: "/products/Y06A_4.jpg" },
  { local: "product-images/Y08B_1.jpg", key: "/products/Y08B_1.jpg" },
  { local: "product-images/Y08B_2.jpg", key: "/products/Y08B_2.jpg" },
  { local: "product-images/MR01_1.jpg", key: "/products/MR01_1.jpg" },
  { local: "product-images/MR01_2.jpg", key: "/products/MR01_2.jpg" },
  { local: "product-images/MR01_3.jpg", key: "/products/MR01_3.jpg" },
  { local: "product-images/logo.jpg", key: "/products/logo.jpg" },
];

const uploaded = {};
for (const { local, key } of imageFiles) {
  const body = readFileSync(local);
  process.stdout.write(`Uploading ${key}... `);
  const res = await r2("PUT", key, body, "image/jpeg");
  if (res.status === 200 || res.status === 201) {
    const url = `https://pub-${ACCOUNT_ID}.r2.cloudflarestorage.com${key}`;
    console.log(`✅ ${url}`);
    uploaded[key] = url;
  } else {
    console.log(`❌ ${res.status}: ${res.body.substring(0, 120)}`);
  }
}

writeFileSync("r2_uploaded.json", JSON.stringify(uploaded, null, 2));
console.log("\n✅ Done! Results in r2_uploaded.json");
