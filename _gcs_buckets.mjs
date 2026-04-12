import { GoogleAuth } from "google-auth-library";
import { readFileSync } from "fs";

const svc = JSON.parse(readFileSync("./firebase-admin.json", "utf8"));
const auth = new GoogleAuth({ 
  credentials: { client_email: svc.client_email, private_key: svc.private_key }, 
  scopes: ["https://www.googleapis.com/auth/cloud-platform"] 
});
const client = await auth.getClient();
const t = (await client.getAccessToken())?.token;

// List GCS buckets for this project
const projNumber = "728006418720";
const resp = await fetch(`https://storage.googleapis.com/storage/v1/b?project=${projNumber}`, {
  headers: { Authorization: `Bearer ${t}` }
});
const data = await resp.json();
console.log("GCS buckets:", JSON.stringify(data, null, 2).substring(0, 500));
