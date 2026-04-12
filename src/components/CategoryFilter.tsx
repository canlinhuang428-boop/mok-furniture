"use client";

import { Category } from "@/lib/types";

interface Props {
  categories: Category[];
  active: string;
  onSelect: (id: string) => void;
}

export default function CategoryFilter({ categories, active, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide">
      <button
        onClick={() => onSelect("all")}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          active === "all"
            ? "bg-blue-500 text-white"
            : "bg-white text-gray-600 hover:bg-gray-100 border"
        }`}
      >
        ทั้งหมด
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === cat.id
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border"
          }`}
        >
          {cat.name_th}
        </button>
      ))}
    </div>
  );
}
