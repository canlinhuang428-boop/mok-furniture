import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: { client_email: svc.client_email, private_key: svc.private_key }, 
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;

// Download image via Firebase Storage REST API (with auth token)
const files = [
  "products/Y06A_1.jpg",
  "products/Y06A_2.jpg", 
  "products/Y08B_1.jpg",
  "products/logo.jpg"
];

for (const file of files) {
  const encoded = encodeURIComponent(file);
  const url = `https://firebasestorage.googleapis.com/v0/b/th-mok.firebasestorage.app/o/${encoded}?alt=media`;
  
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${t}` }
  });
  console.log(`${file}: ${resp.status} ${resp.headers.get('content-type')}`);
  
  if (resp.ok) {
    const buf = await resp.arrayBuffer();
    const fname = file.split('/')[1];
    fs.writeFileSync(`/tmp/${fname}`, Buffer.from(buf));
    console.log(`  Saved ${buf.byteLength} bytes to /tmp/${fname}`);
  }
}
