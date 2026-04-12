"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const emptyForm = {
    id: "", name_th: "", name_en: "", category: "cabinet", sku: "",
    size: "", price: 0, original_price: 0, image: "", status: true, sort: 1, tags: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const snap = await getDocs(query(collection(db, "products"), orderBy("sort", "asc")));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      id: p.id, name_th: p.name_th, name_en: p.name_en,
      category: p.category, sku: p.sku, size: p.size,
      price: p.price, original_price: p.original_price,
      image: p.image, status: p.status, sort: p.sort,
      tags: p.tags.join(", "),
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      price: Number(form.price),
      original_price: Number(form.original_price),
      sort: Number(form.sort),
    };

    if (editing) {
      await updateDoc(doc(db, "products", editing.id), data);
    } else {
      await addDoc(collection(db, "products"), { ...data, created_at: serverTimestamp() });
    }

    setShowForm(false);
    loadProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm("确认删除？")) return;
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  }

  async function toggleStatus(p: Product) {
    await updateDoc(doc(db, "products", p.id), { status: !p.status });
    loadProducts();
  }

  if (loading) return <div>กำลังโหลด...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📦 商品管理</h1>
        <button onClick={openNew} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + 新增商品
        </button>
      </div>

      {/* 产品列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">排序</th>
              <th className="text-left p-3 font-medium text-gray-600">图片</th>
              <th className="text-left p-3 font-medium text-gray-600">名称</th>
              <th className="text-left p-3 font-medium text-gray-600">SKU</th>
              <th className="text-left p-3 font-medium text-gray-600">价格</th>
              <th className="text-left p-3 font-medium text-gray-600">状态</th>
              <th className="text-left p-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{p.sort}</td>
                <td className="p-3">
                  <img
                    src={p.image || `https://placehold.co/40?text=${p.sku}`}
                    alt={p.name_th}
                    className="w-10 h-10 object-cover rounded"
                  />
                </td>
                <td className="p-3 font-medium text-gray-800 th-text">{p.name_th}</td>
                <td className="p-3 text-gray-500">{p.sku}</td>
                <td className="p-3">
                  <span className="text-orange-500 font-bold">{p.price}</span>
                  {p.original_price > p.price && (
                    <span className="text-gray-400 line-through text-xs ml-1">{p.original_price}</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleStatus(p)}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      p.status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {p.status ? "上架" : "下架"}
                  </button>
                </td>
                <td className="p-3">
                  <button onClick={() => openEdit(p)} className="text-blue-500 hover:underline mr-3">编辑</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">删除</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">ยังไม่มีสินค้า</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 弹窗表单 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg">{editing ? "编辑商品" : "新增商品"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">产品ID (SKU)</label>
                  <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Y06A" required={!editing} disabled={!!editing} />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">分类</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="cabinet" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">泰文名称 *</label>
                <input value={form.name_th} onChange={(e) => setForm({ ...form, name_th: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ตู้เอกสารเหล็ก 2 บานเปิด" required />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">英文名称</label>
                <input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Steel Cabinet 2 Door" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">尺寸</label>
                  <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="85x39x180 cm" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">售价 *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">原价</label>
                  <input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">图片链接</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">排序 (数字越小越前)</label>
                  <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">标签 (逗号分隔)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="พร้อมส่ง, เก็บเงินปลายทาง" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium">
                  {editing ? "保存修改" : "新增商品"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
