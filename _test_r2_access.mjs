import aws4 from "aws4";
import { readFileSync } from "fs";

const ACCOUNT_ID = "6fec257ce1fa5321a4fa21e2d8e87438";
const ACCESS_KEY = "969384a0287853edc8ec348d7e1ea019";
const SECRET_KEY = "0576c20d70ea4992e9c9ef148e7e91315818e49fcce1dd635ac1bd927b7f4b5e";
const BUCKET = "mok-images";
const HOST = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const creds = { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY };

async function r2(method, path, body, ct) {
  const headers = { "x-amz-content-sha256": "UNSIGNED-PAYLOAD", host: HOST };
  if (ct) headers["Content-Type"] = ct;
  if (body) headers["content-length"] = String(body.length);
  const opts = { host: HOST, path: `/${BUCKET}${path}`, service: "s3", region: "auto", method, headers };
  aws4.sign(opts, creds);
  const resp = await fetch(`https://${HOST}/${BUCKET}${path}`, { method, headers: opts.headers, body });
  return { status: resp.status, body: await resp.text() };
}

async function main() {
  // 1. List objects in bucket
  console.log("=== Listing bucket objects ===");
  const list = await r2("GET", "/?list=1", null);
  console.log("Status:", list.status);
  console.log("Body preview:", list.body.substring(0, 300));
  
  // 2. Check if we can GET an object (should work with auth)
  console.log("\n=== GET object with auth ===");
  const get = await r2("GET", "/products/Y06A_1.jpg", null);
  console.log("Status:", get.status);
  console.log("Body length:", get.body.length, "bytes");
  console.log("Content preview:", get.body.substring(0, 50));
  
  // 3. Try public URL (no auth)
  console.log("\n=== Testing public URL (no auth) ===");
  const pub = await fetch(`https://pub-${ACCOUNT_ID}.r2.cloudflarestorage.com/products/Y06A_1.jpg`);
  console.log("Public URL status:", pub.status);
  console.log("Public URL content-type:", pub.headers.get("content-type"));
}

main().catch(console.error);
