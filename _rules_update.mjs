import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: { client_email: svc.client_email, private_key: svc.private_key }, 
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;

// We know the service account has firebaserules.releases.update permission
// Try the correct release path
const releasePath = "projects/th-mok/releases/firebase.storage/th-mok.firebasestorage.app";

// Get current release first
const getResp = await fetch(`https://firebaserules.googleapis.com/v1/${releasePath}`, {
  headers: { Authorization: `Bearer ${t}` }
});
console.log("GET release status:", getResp.status);
const getData = await getResp.json();
console.log("Current release:", JSON.stringify(getData).substring(0, 300));

// Create a new ruleset
const rulesContent = readFileSync("./storage.rules", "utf8");
const rsResp = await fetch("https://firebaserules.googleapis.com/v1/projects/th-mok/rulesets", {
  method: "POST",
  headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
  body: JSON.stringify({ source: { files: [{ name: "storage.rules", content: rulesContent }] } })
});
const rsData = await rsResp.json();
console.log("New ruleset:", rsResp.status, JSON.stringify(rsData).substring(0, 200));

if (rsData.name) {
  // Try PATCH with ruleset_name (snake_case)
  const patchResp = await fetch(`https://firebaserules.googleapis.com/v1/${releasePath}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ruleset_name: rsData.name })
  });
  console.log("PATCH (snake_case) status:", patchResp.status, JSON.stringify(await patchResp.json()).substring(0, 200));
}
