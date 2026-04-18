import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const ADMIN_PWD = process.env.ADMIN_PASSWORD || "admin123";

function authCheck(req: NextRequest) {
  const pwd = req.headers.get("x-admin-pwd");
  return pwd === ADMIN_PWD;
}

export async function GET() {
  if (!adminDb) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
  try {
    const snap = await adminDb.collection("products").orderBy("sort_order", "asc").get();
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json(products);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!adminDb) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
  try {
    const body = await req.json();
    const { id, ...fields } = body;

    // Convert arrays to Firestore array format
    const fsFields: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (Array.isArray(v)) fsFields[k] = { arrayValue: { values: v.map(item => ({ stringValue: String(item) })) } };
      else if (typeof v === "number") fsFields[k] = { integerValue: String(v) };
      else if (typeof v === "boolean") fsFields[k] = { booleanValue: v };
      else fsFields[k] = { stringValue: String(v ?? "") };
    }

    if (id) {
      await adminDb.collection("products").doc(id).set(fsFields, { merge: true });
      return NextResponse.json({ id, success: true });
    } else {
      const docRef = await adminDb.collection("products").add(fsFields);
      return NextResponse.json({ id: docRef.id, success: true });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!adminDb) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
  try {
    const body = await req.json();
    const { id, ...fields } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const fsFields: Record<string, any> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (Array.isArray(v)) fsFields[k] = { arrayValue: { values: v.map(item => ({ stringValue: String(item) })) } };
      else if (typeof v === "number") fsFields[k] = { integerValue: String(v) };
      else if (typeof v === "boolean") fsFields[k] = { booleanValue: v };
      else fsFields[k] = { stringValue: String(v ?? "") };
    }

    await adminDb.collection("products").doc(id).set(fsFields, { merge: true });
    return NextResponse.json({ id, success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!authCheck(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!adminDb) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await adminDb.collection("products").doc(id).delete();
    return NextResponse.json({ id, success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
