import { NextRequest } from "next/server";
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { readFileSync } from "fs";

let adminInitialized = false;

function initAdmin() {
  if (adminInitialized) return;
  try {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "th-mok",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "th-mok.firebasestorage.app",
    });
    adminInitialized = true;
    console.log("Firebase Admin initialized successfully");
  } catch (e: any) {
    console.error("Firebase init error:", e?.message);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  initAdmin();

  const key = params.path.join("/");
  if (!key) {
    return new Response("No path provided", { status: 400 });
  }

  if (!adminInitialized) {
    return new Response("Firebase init failed - check server logs", { status: 500 });
  }

  try {
    const storage = getStorage();
    const bucket = storage.bucket();
    const file = bucket.file(key);

    console.log(`Downloading ${key}...`);
    const [data, meta] = await Promise.all([
      file.download(),
      file.getMetadata(),
    ]);

    console.log(`Downloaded ${key}: ${data.length} bytes, contentType=${meta[0].contentType}`);
    console.log(`First 20 bytes: ${Array.from(data[0].slice(0, 20)).map(b => b.toString(16)).join(" ")}`);

    const isHtml = data[0].slice(0, 5).toString() === "<!doc" || data[0].slice(0, 5).toString() === "<!HTM";

    if (isHtml) {
      console.log("WARNING: Downloaded data is HTML, not an image!");
      return new Response("Image blocked by WAF (downloaded HTML)", { status: 502 });
    }

    return new Response(data[0], {
      status: 200,
      headers: {
        "Content-Type": meta[0].contentType || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Image-Size": String(data.length),
      },
    });
  } catch (e: any) {
    console.error(`Download error for ${key}:`, e?.code, e?.message);
    return new Response(`Error: ${e?.code} - ${e?.message}`, { status: 502 });
  }
}
