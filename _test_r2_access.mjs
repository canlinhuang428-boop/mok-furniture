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
  // 1. List ALL objects in bucket using ListObjectsV2
  console.log("=== Listing ALL bucket objects (V2) ===");
  const list = await r2("GET", "/?list-type=2&max-keys=1000", null);
  console.log("Status:", list.status);
  // Extract all keys
  const keys = list.body.match(/<Key>(.*?)<\/Key>/g) || [];
  console.log("All files:", keys.map(k => k.replace(/<Key>|\<\/Key>/g, '')).join('\n'));
  
  // 2. Check if we can GET an object (should work with auth)
  console.log("\n=== GET object with auth ===");
  const get = await r2("GET", "/products/Y06A_1.jpg", null);
  console.log("Status:", get.status);
  console.log("Body length:", get.body.length, "bytes");
  // Show if it's HTML (error page) or actual image bytes
  const isHTML = get.body.startsWith('<!doctype') || get.body.startsWith('<html');
  console.log("Is HTML error page:", isHTML);
  if (isHTML) {
    console.log("HTML preview:", get.body.substring(0, 200));
  } else {
    console.log("Image preview (hex):", get.body.substring(0, 50).charCodeAt(0).toString(16));
  }
  
  // 3. Try mage/ prefix
  console.log("\n=== GET object with mage/ prefix ===");
  const get2 = await r2("GET", "/mage/products/Y06A_1.jpg", null);
  console.log("Status:", get2.status);
  console.log("Body length:", get2.body.length, "bytes");
  const isHTML2 = get2.body.startsWith('<!doctype') || get2.body.startsWith('<html');
  console.log("Is HTML error page:", isHTML2);
  if (isHTML2) console.log("HTML preview:", get2.body.substring(0, 200));
}

main().catch(console.error);
