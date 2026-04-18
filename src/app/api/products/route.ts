import { NextResponse } from "next/server";

const PROJECT_ID = "th-mok";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export async function GET() {
  try {
    const res = await fetch(
      `${BASE_URL}/products?orderBy=sort_order&pageSize=100`,
      {
        headers: {
          "Content-Type": "application/json",
          // Vercel 环境自带 Firebase token（如果配置了 Vercel Firebase Integration）
          // 否则需要手动设置 FIREBASE_API_KEY 环境变量
          "Authorization": `Bearer ${process.env.FIREBASE_API_KEY || ""}`,
        },
        next: { revalidate: 30 }, // CDN 缓存 30 秒
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text, products: [] }, { status: res.status });
    }

    const data = await res.json();
    const products = (data.documents || []).map((doc: any) => {
      const fields = doc.fields || {};
      // Firestore REST API 返回的字段需要转换
      const result: any = { id: doc.name.split("/").pop() };
      for (const [key, val] of Object.entries(fields)) {
        if ((val as any).stringValue !== undefined) result[key] = (val as any).stringValue;
        else if ((val as any).integerValue !== undefined) result[key] = Number((val as any).integerValue);
        else if ((val as any).doubleValue !== undefined) result[key] = Number((val as any).doubleValue);
        else if ((val as any).booleanValue !== undefined) result[key] = (val as any).booleanValue;
        else if ((val as any).arrayValue) result[key] = ((val as any).arrayValue.values || []).map((v: any) => v.stringValue || v.integerValue);
        else if ((val as any).mapValue) result[key] = (val as any).mapValue;
        else result[key] = val;
      }
      return result;
    });

    return NextResponse.json({ products, count: products.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, products: [], count: 0 }, { status: 500 });
  }
}
