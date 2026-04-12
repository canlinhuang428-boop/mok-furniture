import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: { client_email: svc.client_email, private_key: svc.private_key }, 
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;

// Try to enable the service
const enableUrl = "https://serviceusage.googleapis.com/v1/projects/th-mok/services/firebasestorage.googleapis.com:enable";

const resp = await fetch(enableUrl, {
  method: "POST",
  headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
  body: JSON.stringify({})
});
console.log("Enable status:", resp.status);
const text = await resp.text();
console.log("Response:", text.substring(0, 300));

// Also check if there's a "disabled" service we can enable
const listUrl = "https://serviceusage.googleapis.com/v1/projects/th-mok/services?filter=state:DISABLED";
const listResp = await fetch(listUrl, { headers: { Authorization: `Bearer ${t}` } });
const listData = await listResp.json();
console.log("\nDisabled services:");
(listData.services || []).slice(0, 10).forEach(s => console.log(" -", s.name, s.state));
