import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: { client_email: svc.client_email, private_key: svc.private_key }, 
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;

const projResp = await fetch("https://cloudresourcemanager.googleapis.com/v1/projects/th-mok", {
  headers: { Authorization: `Bearer ${t}` }
});
const projData = await projResp.json();
console.log("Project number:", projData.projectNumber);

// Try to list buckets using the project number
const bucketsResp = await fetch(
  `https://storage.googleapis.com/storage/v1/b?project=${projData.projectNumber}`,
  { headers: { Authorization: `Bearer ${t}` } }
);
console.log("Buckets status:", bucketsResp.status);
const bucketsData = await bucketsResp.json();
console.log("Buckets:", JSON.stringify(bucketsData).substring(0, 500));

// Try common Firebase Storage bucket names
const commonNames = [
  `${projData.projectNumber}`,
  "th-mok.appspot.com", 
  "th-mok.firebasestorage.app"
];

for (const bucket of commonNames) {
  const resp = await fetch(`https://storage.googleapis.com/storage/v1/b/${bucket}/iam`, {
    headers: { Authorization: `Bearer ${t}` }
  });
  console.log(`\nBucket ${bucket}:`, resp.status);
  if (resp.status === 200) {
    const data = await resp.json();
    console.log("IAM bindings:", JSON.stringify(data.bindings || []).substring(0, 300));
  }
}
