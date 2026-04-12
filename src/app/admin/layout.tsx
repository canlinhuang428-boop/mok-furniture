"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-6 h-14">
            <span className="font-bold">⚙️ MOK 后台</span>
            <Link href="/admin/products" className="text-sm hover:text-gray-300">商品管理</Link>
            <Link href="/admin/categories" className="text-sm hover:text-gray-300">分类管理</Link>
            <Link href="/admin/orders" className="text-sm hover:text-gray-300">询价单</Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-300 ml-auto">← 回到前台</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
