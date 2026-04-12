import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: svc,  // Pass the entire service account JSON as credentials
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;
console.log("Token prefix:", t?.substring(0, 20));

const rulesContent = readFileSync("./storage.rules", "utf8");
const rsResp = await fetch("https://firebaserules.googleapis.com/v1/projects/th-mok/rulesets", {
  method: "POST",
  headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
  body: JSON.stringify({ source: { files: [{ name: "storage.rules", content: rulesContent }] } })
});
const rsData = await rsResp.json();
console.log("New ruleset:", rsResp.status, rsData.name?.split('/').pop());

if (rsData.name) {
  // Try the UpdateRelease with ruleset name as per the official API
  // The field might just need to match what the proto expects
  const releasePath = "projects/th-mok/releases/firebase.storage/th-mok.firebasestorage.app";
  
  // Try a different format: pass the ruleset inline in the release
  const patchResp = await fetch(`https://firebaserules.googleapis.com/v1/${releasePath}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      name: releasePath,
      ruleset: { name: rsData.name }
    })
  });
  console.log("PATCH with name+ruleset:", patchResp.status, JSON.stringify(await patchResp.json()).substring(0, 200));
  
  // Also try just the ruleset reference
  const patchResp2 = await fetch(`https://firebaserules.googleapis.com/v1/${releasePath}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      ruleset: { name: rsData.name, source: rsData.source }
    })
  });
  console.log("PATCH with inline ruleset:", patchResp2.status, JSON.stringify(await patchResp2.json()).substring(0, 200));
}
