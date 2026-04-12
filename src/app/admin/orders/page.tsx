"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/lib/types";

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: "待联系", color: "bg-yellow-100 text-yellow-700" },
  contacted: { text: "已联系", color: "bg-blue-100 text-blue-700" },
  completed: { text: "已完成", color: "bg-green-100 text-green-700" },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    const snap = await getDocs(query(collection(db, "orders"), orderBy("created_at", "desc")));
    setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await updateDoc(doc(db, "orders", id), { status });
    loadOrders();
  }

  if (loading) return <div>กำลังโหลด...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 询价单管理</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">ยังไม่มีคำถาม</div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const status = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
            return (
              <div key={o.id} className="bg-white rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800">{o.name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{o.phone}</div>
                    {o.address && <div className="text-sm text-gray-400 mt-0.5">{o.address}</div>}
                    <div className="text-xs text-gray-400 mt-1">
                      {o.created_at ? new Date(o.created_at).toLocaleString("th-TH") : ""}
                    </div>
                  </div>

                  {/* 状态操作 */}
                  <div className="flex gap-1">
                    {(["pending", "contacted", "completed"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => o.id && updateStatus(o.id, s)}
                        className={`px-2 py-1 rounded text-xs ${
                          o.status === s ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {STATUS_LABELS[s].text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 商品列表 */}
                {o.items?.length > 0 && (
                  <div className="border-t pt-3 mb-3">
                    <p className="text-xs text-gray-500 mb-2">加购商品：</p>
                    <div className="flex flex-wrap gap-2">
                      {o.items.map((item, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {item.product_id} × {item.qty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {o.remark && (
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 mb-1">备注：</p>
                    <p className="text-sm text-gray-700">{o.remark}</p>
                  </div>
                )}

                {/* 联系客户 */}
                <div className="mt-3 flex gap-2">
                  <a href={`tel:${o.phone}`} className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg">📞 联系</a>
                  <a href={`https://wa.me/66${o.phone.replace(/^0/, "")}`} target="_blank" className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg">WhatsApp</a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
