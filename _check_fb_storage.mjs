import firebase from "firebase-admin";
import serviceAccount from "./firebase-admin.json" assert { type: "json" };

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  storageBucket: "th-mok.firebasestorage.app"
});

const storage = firebase.storage();

async function test() {
  console.log("Bucket:", storage.bucket().name);
  
  const file = storage.bucket().file("products/Y06A_1.jpg");
  
  // Check metadata
  try {
    const [metadata] = await file.getMetadata();
    console.log("✅ File metadata:", metadata.name, "| Size:", metadata.size);
  } catch(e) {
    console.log("❌ getMetadata error:", e.code, e.message.substring(0, 150));
  }
  
  // Try getSignedUrl
  try {
    const [url] = await file.getSignedUrl({ action: "READ", expires: "2099-12-31" });
    console.log("✅ Signed URL:", url.substring(0, 120));
  } catch(e) {
    console.log("❌ getSignedUrl error:", e.code, e.message.substring(0, 150));
  }
}

test().catch(console.error);
