"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/lib/types";

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name_th, setName_th] = useState("");
  const [sort, setSort] = useState(1);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => { loadCats(); }, []);

  async function loadCats() {
    const snap = await getDocs(query(collection(db, "categories"), orderBy("sort", "asc")));
    setCats(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = editing?.id || name_th.toLowerCase().replace(/\s+/g, "-").slice(0, 20);
    if (editing) {
      await updateDoc(doc(db, "categories", editing.id), { name_th, sort: Number(sort) });
    } else {
      await addDoc(collection(db, "categories"), { id, name_th, sort: Number(sort) });
    }
    setName_th(""); setSort(1); setEditing(null);
    loadCats();
  }

  async function handleDelete(id: string) {
    if (!confirm("删除此分类？")) return;
    await deleteDoc(doc(db, "categories", id));
    loadCats();
  }

  if (loading) return <div>กำลังโหลด...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📁 分类管理</h1>

      {/* 新增表单 */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <h2 className="font-bold text-gray-700 mb-3">{editing ? "编辑分类" : "新增分类"}</h2>
        <form onSubmit={handleSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-600 mb-1 block">泰文名称</label>
            <input value={name_th} onChange={(e) => setName_th(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ตู้เอกสาร" required />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">排序</label>
            <input type="number" value={sort} onChange={(e) => setSort(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm w-20" />
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium">
            {editing ? "保存" : "新增"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setName_th(""); setSort(1); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
              取消
            </button>
          )}
        </form>
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">排序</th>
              <th className="text-left p-3 font-medium text-gray-600">ID</th>
              <th className="text-left p-3 font-medium text-gray-600">泰文名称</th>
              <th className="text-left p-3 font-medium text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{c.sort}</td>
                <td className="p-3 text-gray-500">{c.id}</td>
                <td className="p-3 font-medium text-gray-800 th-text">{c.name_th}</td>
                <td className="p-3">
                  <button onClick={() => { setEditing(c); setName_th(c.name_th); setSort(c.sort ?? 1); }} className="text-blue-500 hover:underline mr-3">编辑</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
