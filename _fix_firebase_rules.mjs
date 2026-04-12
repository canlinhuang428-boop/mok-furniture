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

// Step 1: Create a new ruleset
const rsResp = await fetch("https://firebaserules.googleapis.com/v1/projects/th-mok/rulesets", {
  method: "POST",
  headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
  body: JSON.stringify({ source: { files: [{ name: "storage.rules", content: rulesContent }] } })
});
const rsData = await rsResp.json();
if (!rsData.name) { console.log("Failed to create ruleset:", JSON.stringify(rsData)); process.exit(1); }
console.log("Created ruleset:", rsData.name.split('/').pop());

const rsName = rsData.name;

// Step 2: Update the release using the UpdateRelease API
// The correct field name for UpdateRelease might be different
// Let's try: ruleset as inline object (which worked for CreateRelease)
const patch1 = await fetch("https://firebaserules.googleapis.com/v1/projects/th-mok/releases/firebase.storage/th-mok.firebasestorage.app", {
  method: "PATCH",
  headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
  body: JSON.stringify({ ruleset: { name: rsName, source: rsData.source } })
});
console.log("PATCH ruleset inline:", patch1.status, JSON.stringify(await patch1.json()).substring(0, 200));

// Step 3: Try getting the release after the update
const getResp = await fetch("https://firebaserules.googleapis.com/v1/projects/th-mok/releases/firebase.storage/th-mok.firebasestorage.app", {
  headers: { Authorization: `Bearer ${t}` }
});
const release = await getResp.json();
console.log("Current release ruleset:", release.rulesetName?.split('/').pop());
