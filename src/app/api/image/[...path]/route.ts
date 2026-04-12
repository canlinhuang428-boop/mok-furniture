import { NextRequest } from "next/server";
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

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
    console.log("Firebase Admin initialized");
  } catch (e: any) {
    console.error("Firebase init error:", e?.message);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  initAdmin();

  const { path } = await context.params;
  const key = path.join("/");
  if (!key) {
    return new Response("No path provided", { status: 400 });
  }

  if (!adminInitialized) {
    return new Response("Firebase init failed", { status: 500 });
  }

  try {
    const storage = getStorage();
    const bucket = storage.bucket();
    const file = bucket.file(key);

    const [data, meta] = await Promise.all([
      file.download(),
      file.getMetadata(),
    ]);

    const isHtml =
      data[0].slice(0, 5).toString() === "<!doc" ||
      data[0].slice(0, 5).toString() === "<!HTM";

    if (isHtml) {
      console.log(`WAF blocked ${key} - got HTML instead of image`);
      return new Response("Image blocked by WAF", { status: 502 });
    }

    const imageData = new Uint8Array(data[0]);
    return new Response(imageData as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": meta[0].contentType || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Image-Size": String(data[0].length),
      },
    });
  } catch (e: any) {
    console.error(`Download error for ${key}:`, e?.code, e?.message);
    return new Response(`Error: ${e?.code} - ${e?.message}`, { status: 502 });
  }
}
