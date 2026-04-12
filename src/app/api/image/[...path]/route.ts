import { NextRequest } from "next/server";

let adminInitialized = false;

function initAdmin() {
  if (adminInitialized) return;
  try {
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "th-mok",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "th-mok.firebasestorage.app",
      });
    }
    adminInitialized = true;
  } catch (e: any) {
    console.error("Firebase init error:", e?.message);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  initAdmin();
  if (!adminInitialized) {
    return new Response("Firebase init failed", { status: 500 });
  }

  const key = params.path.join("/");
  if (!key) {
    return new Response("No path provided", { status: 400 });
  }

  try {
    const admin = require("firebase-admin");
    const storage = admin.storage();
    const bucket = storage.bucket();

    const [data] = await bucket.file(key).download();

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e: any) {
    console.error("Download error:", e?.code, e?.message);
    return new Response("Error: " + (e?.message || "unknown"), { status: 502 });
  }
}
