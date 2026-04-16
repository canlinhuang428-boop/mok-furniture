"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Cart, Product, Order } from "@/lib/types";
import { AuthProvider } from "@/lib/auth";
import { serverTimestamp, addDoc } from "firebase/firestore";

function CartContent() {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  if (!user) return null;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 表单
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [remark, setRemark] = useState("");

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "carts", user.uid), async (snap) => {
      const data = snap.data() as Cart | undefined;
      setCart(data || null);

      if (data?.items?.length) {
        const ids = data.items.map((i) => i.product_id);
        const q = query(collection(db, "products"), where("__name__", "in", ids));
        const prodSnap = await getDocs(q);
        const prodMap: Record<string, Product> = {};
        prodSnap.docs.forEach((d) => {
          prodMap[d.id] = { id: d.id, ...d.data() } as Product;
        });
        setProducts(prodMap);
      }
      setLoading(false);
    });

    return unsub;
  }, [user]);

  async function updateQty(productId: string, delta: number) {
    if (!user || !cart) return;
    const items = cart.items
      .map((i) =>
        i.product_id === productId ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      )
      .filter((i) => i.qty > 0);

    await import("firebase/firestore").then(({ doc, setDoc, serverTimestamp }) =>
      setDoc(doc(db, "carts", user.uid), { items, updated_at: serverTimestamp() }, { merge: true })
    );
  }

  async function submitOrder() {
    if (!user || !cart || !name || !phone) return;
    setSubmitting(true);

    try {
      const order: Omit<Order, "id"> = {
        user_id: user.uid,
        name,
        phone,
        address,
        items: cart.items,
        remark,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      await addDoc(collection(db, "orders"), order);

      // 清空购物车
      await import("firebase/firestore").then(({ doc, setDoc, serverTimestamp }) =>
        setDoc(doc(db, "carts", user.uid), { items: [], updated_at: serverTimestamp() })
      );

      setSubmitted(true);
    } catch (e) {
      console.error("提交失败:", e);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return <div className="p-8 text-center">กำลังโหลด...</div>;
  if (loading) return <div className="p-8 text-center">กำลังโหลด...</div>;

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ส่งคำถามแล้ว!</h2>
        <p className="text-gray-500 mb-6">
          แม่ค้าจะติดต่อกลับไปที่ <b>{phone}</b> เร็วๆ นี้
        </p>
        <Link href="/" className="text-blue-500 hover:underline">
          ← กลับหน้าแรก
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => {
    const p = products[item.product_id];
    return sum + (p?.price || 0) * item.qty;
  }, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🛒 ตะกร้าสินค้า</h1>
        <Link href="/" className="text-blue-500 text-sm hover:underline">
          ← ดูสินค้าต่อ
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-500 mb-4">ตะกร้าว่างเปล่า</p>
          <Link href="/" className="text-blue-500 hover:underline">
            ไปช้อปต่อ →
          </Link>
        </div>
      ) : (
        <>
          {/* 商品列表 */}
          <div className="space-y-3 mb-6">
            {items.map((item) => {
              const p = products[item.product_id];
              if (!p) return null;
              return (
                <div key={item.product_id} className="bg-white rounded-xl p-4 flex gap-4 shadow-sm">
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={p.image || `https://placehold.co/80?text=${p.sku}`}
                      alt={p.name_th}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 text-sm th-text">{p.name_th}</h3>
                    <p className="text-xs text-gray-400">{p.sku} · {p.size}</p>
                    <p className="text-orange-500 font-bold mt-1">
                      ฿{(p.price ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => updateQty(item.product_id, -999)}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.product_id, -1)}
                        className="w-7 h-7 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                      >
                        −
                      </button>
                      <span className="font-medium w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.product_id, 1)}
                        className="w-7 h-7 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 总计 */}
          <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">รวมทั้งหมด</span>
              <span className="text-2xl font-bold text-orange-500">
                ฿{total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 提交询价表单 */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4">📝 ส่งคำถาม / สั่งซื้อ</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">ชื่อลูกค้า *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="กรอกชื่อของคุณ"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">เบอร์โทร *</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="0xx-xxx-xxxx"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">ที่อยู่</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={2}
                  placeholder="ที่อยู่จัดส่ง (ถ้ามี)"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">หมายเหตุ</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={2}
                  placeholder="รายละเอียดเพิ่มเติม..."
                />
              </div>

              <button
                onClick={submitOrder}
                disabled={submitting || !name || !phone}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {submitting ? "กำลังส่ง..." : "📨 ส่งคำถามไปยังแม่ค้า"}
              </button>
            </div>
          </div>

          {/* 联系客服 */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400 mb-2">หรือติดต่อแม่ค้าโดยตรง</p>
            <div className="flex justify-center gap-3">
              <a href="https://line.me/ti/p/@639isuyr" target="_blank" className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm">LINE</a>
              <a href="https://wa.me/66XXXXXXXXX" target="_blank" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">WhatsApp</a>
              <a href="https://m.me/MOKHomeware" target="_blank" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">Messenger</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <AuthProvider>
      <CartContent />
    </AuthProvider>
  );
}
