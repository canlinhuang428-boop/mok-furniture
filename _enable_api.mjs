import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: { client_email: svc.client_email, private_key: svc.private_key }, 
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;

// Try to enable the API
const enableResp = await fetch("https://serviceusage.googleapis.com/v1/projects/th-mok/services/firebasestorage.googleapis.com:enable", {
  method: "POST",
  headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
  body: JSON.stringify({})
});
console.log("Enable API status:", enableResp.status);
const text = await enableResp.text();
console.log("Response:", text.substring(0, 300));

// Also check what services ARE enabled
const listResp = await fetch("https://serviceusage.googleapis.com/v1/projects/th-mok/services?filter=state:ENABLED", {
  headers: { Authorization: `Bearer ${t}` }
});
const listData = await listResp.json();
const enabled = listData.services?.filter(s => s.name.includes('firebase') || s.name.includes('storage')) || [];
console.log("\nEnabled Firebase/Storage APIs:");
enabled.forEach(s => console.log(" -", s.name, s.state));
