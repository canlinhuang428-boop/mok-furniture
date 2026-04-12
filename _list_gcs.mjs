import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: { client_email: svc.client_email, private_key: svc.private_key }, 
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;

// Try listing buckets - maybe the Firebase Storage bucket shows up here
const projResp = await fetch("https://cloudresourcemanager.googleapis.com/v1/projects/th-mok", {
  headers: { Authorization: `Bearer ${t}` }
});
const projData = await projResp.json();
console.log("Project:", projData.name, "Number:", projData.projectNumber);

// List GCS buckets  
const bucketsResp = await fetch(`https://storage.googleapis.com/storage/v1/b?project=${projData.projectNumber}`, {
  headers: { Authorization: `Bearer ${t}` }
});
const bucketsData = await bucketsResp.json();
console.log("Buckets:", JSON.stringify(bucketsData, null, 2).substring(0, 500));
