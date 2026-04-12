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

// Create a new ruleset
const newRS = await fetch("https://firebaserules.googleapis.com/v1/projects/th-mok/rulesets", {
  method: "POST",
  headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
  body: JSON.stringify({ source: { files: [{ name: "storage.rules", content: rulesContent }] } })
});
const newRSData = await newRS.json();
console.log("New ruleset created:", newRS.status, newRSData.name?.split('/').pop());

// Now the key question: can we UPDATE the existing release?
// Try the release update with the correct payload format
// Based on Google API conventions, the update might need to be done differently

// Let's try using the `update` method on the release directly with the full path
const releaseUrl = "https://firebaserules.googleapis.com/v1/projects/th-mok/releases/firebase.storage/th-mok.firebasestorage.app";
const updateResp = await fetch(releaseUrl, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
  body: JSON.stringify({ rulesetName: newRSData.name })
});
console.log("Release PATCH status:", updateResp.status);
const updateText = await updateResp.text();
console.log("Update response:", updateText.substring(0, 400));

// Also try: what's the actual error message when accessing Firebase Storage?
const fsTest = await fetch("https://firebasestorage.googleapis.com/v0/b/th-mok.firebasestorage.app/o?versions=true", {
  headers: { Authorization: `Bearer ${t}` }
});
console.log("\nFirebase Storage API test:", fsTest.status);
const fsText = await fsTest.text();
console.log("FS response:", fsText.substring(0, 200));
