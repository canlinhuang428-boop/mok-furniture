"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cart } from "@/lib/types";

export default function CartButton() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, "carts", user.uid), (snap) => {
      const data = snap.data() as Cart | undefined;
      const items = data?.items || [];
      setCount(items.reduce((sum: number, i: { qty: number }) => sum + i.qty, 0));
    });

    return unsub;
  }, [user]);

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-500 px-3 py-2 rounded-lg transition-colors"
    >
      <span>🛒</span>
      <span className="text-sm font-medium">ตะกร้า</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {count}
        </span>
      )}
    </Link>
  );
}
