import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: { client_email: svc.client_email, private_key: svc.private_key }, 
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;

const rulesContent = readFileSync("./storage.rules", "utf8");

// Create a new ruleset with the correct content
const rsResp = await fetch("https://firebaserules.googleapis.com/v1/projects/th-mok/rulesets", {
  method: "POST",
  headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    source: { files: [{ name: "storage.rules", content: rulesContent }] },
    metadata: { services: ["firebase.storage"] }
  })
});
const rsData = await rsResp.json();
console.log("Create ruleset:", rsResp.status, JSON.stringify(rsData).substring(0, 200));

if (rsData.name) {
  const rsName = rsData.name;
  
  // Try PATCH the release using the full resource path
  const releasePath = `projects/th-mok/releases/firebase.storage/th-mok.firebasestorage.app`;
  const patchResp = await fetch(`https://firebaserules.googleapis.com/v1/${releasePath}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: JSON.stringify({ rulesetName: rsName })
  });
  console.log("PATCH release:", patchResp.status, JSON.stringify(await patchResp.json()).substring(0, 200));
  
  // Also try POST to releases collection
  const postResp = await fetch("https://firebaserules.googleapis.com/v1/projects/th-mok/releases", {
    method: "POST",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: JSON.stringify({ rulesetName: rsName, name: releasePath })
  });
  console.log("POST release:", postResp.status, JSON.stringify(await postResp.json()).substring(0, 200));
}
