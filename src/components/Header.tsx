"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import CartButton from "./CartButton";

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="font-bold text-xl text-gray-800">MOK Homeware</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {!loading && user && (
            <span className="text-xs text-gray-400 hidden sm:block">
              ID: {user.uid.slice(0, 6)}
            </span>
          )}
          <CartButton />
          <Link
            href="/admin"
            className="text-sm text-gray-400 hover:text-gray-600 transition"
          >
            ⚙️ 后台
          </Link>
        </div>
      </div>
    </header>
  );
}
