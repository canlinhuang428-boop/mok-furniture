import { GoogleAuth } from "google-auth-library";
import { readFileSync, writeFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: { client_email: svc.client_email, private_key: svc.private_key }, 
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;

// Try the mediaLink URL
const mediaUrl = "https://storage.googleapis.com/download/storage/v1/b/th-mok.firebasestorage.app/o/products%2FY06A_1.jpg?generation=1775986862328666&alt=media";

const resp = await fetch(mediaUrl, { headers: { Authorization: `Bearer ${t}` } });
console.log("Status:", resp.status, "Content-Type:", resp.headers.get("content-type"));

const buf = await resp.arrayBuffer();
writeFileSync("/tmp/y06a_media.jpg", Buffer.from(buf));
console.log("Saved", buf.byteLength, "bytes");
console.log("Magic bytes:", Buffer.from(buf).slice(0, 4).toString("hex"));
console.log("Starts with HTML:", Buffer.from(buf).slice(0, 5).toString() === "<!doc");
