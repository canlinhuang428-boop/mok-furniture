"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToCart() {
    if (!user || adding) return;
    setAdding(true);

    try {
      const cartRef = doc(db, "carts", user.uid);
      const cartSnap = await getDoc(cartRef);
      const existing = cartSnap.data()?.items || [];

      const idx = existing.findIndex(
        (i: { product_id: string }) => i.product_id === product.id
      );

      let newItems: { product_id: string; qty: number }[];
      if (idx >= 0) {
        newItems = existing.map((item: { product_id: string; qty: number }, i: number) =>
          i === idx ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        newItems = [...existing, { product_id: product.id, qty: 1 }];
      }

      await setDoc(
        cartRef,
        { items: newItems, updated_at: serverTimestamp() },
        { merge: true }
      );

      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (e) {
      console.error("加购失败:", e);
    } finally {
      setAdding(false);
    }
  }

  const discount = (product.original_price ?? 0) > (product.price ?? 0)
    ? Math.round((1 - (product.price ?? 0) / (product.original_price ?? 1)) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* 产品图 */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={product.images?.[0] || product.image || `https://placehold.co/400x400?text=${product.sku}`}
          alt={product.name_th}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* 产品信息 */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-medium text-gray-800 text-sm leading-tight mb-1 th-text">
          {product.name_th}
        </h3>
        <p className="text-xs text-gray-400 mb-1">SKU: {product.sku}</p>
        <p className="text-xs text-gray-500 mb-2">{product.size}</p>

        {/* 价格 */}
        <div className="mb-2">
          <span className="text-orange-500 font-bold text-lg">
            ฿{(product.price ?? 0).toLocaleString()}
          </span>
          {(product.original_price ?? 0) > (product.price ?? 0) && (
            <span className="text-gray-400 text-xs line-through ml-2">
              ฿{(product.original_price ?? 0).toLocaleString()}
            </span>
          )}
        </div>

        {/* 服务标签 */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 加购按钮 */}
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`mt-auto w-full py-2 rounded-lg text-sm font-medium transition-all ${
            added
              ? "bg-green-500 text-white"
              : "bg-orange-500 hover:bg-orange-600 text-white active:scale-95"
          } disabled:opacity-50`}
        >
          {adding ? "..." : added ? "✓ เพิ่มแล้ว" : "+ เพิ่มลงตะกร้า"}
        </button>
      </div>
    </div>
  );
}
