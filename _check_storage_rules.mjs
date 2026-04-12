import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: { client_email: svc.client_email, private_key: svc.private_key }, 
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;

// Get releases
const resp = await fetch("https://firebaserules.googleapis.com/v1/projects/th-mok/releases", {
  headers: { Authorization: `Bearer ${t}` }
});
const data = await resp.json();
console.log("Current releases:");
data.releases?.forEach(r => {
  console.log(" -", r.name.split('/').pop(), "→ ruleset:", r.rulesetName.split('/').pop());
});

// Get rulesets
const rsResp = await fetch("https://firebaserules.googleapis.com/v1/projects/th-mok/rulesets", {
  headers: { Authorization: `Bearer ${t}` }
});
const rsData = await rsResp.json();
const storageRS = rsData.rulesets?.filter(r => r.metadata?.services?.includes("firebase.storage")) || [];
console.log("\nStorage rulesets:");
storageRS.forEach(rs => {
  console.log(" -", rs.name.split('/').pop());
  console.log("   Rules:", rs.source?.files?.[0]?.content?.replace(/\n/g, ' ').substring(0, 100));
});
