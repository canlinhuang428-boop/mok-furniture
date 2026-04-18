"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search, ShoppingCart, X, Plus, Minus,
  ChevronLeft, Settings, Trash2, Download, ArrowUp, ArrowDown,
  Check, Box
} from "lucide-react";
import { Product, Cart, Lang } from "@/lib/types";
import { PRODUCTS } from "@/data/products";

const BRAND_LOGO_URL = "https://pub-6fec257ce1fa5321a4fa21e2d8e87438.r2.cloudflarestorage.com/products/logo.jpg";
const C = { blue: "#008AD8", orange: "#E86A1A", green: "#38A959", slate: "#0f172a" };

const T = {
  th: {
    searchPlaceholder: "ค้นหาสินค้า...",
    welcome: "สวัสดีครับ/ค่ะ 👋",
    welcomeSub: "แคปรูปสินค้าที่สนใจ ส่งให้แอดมินเช็คสต็อกและเสนอราคาได้เลย!",
    categories: "หมวดหมู่สินค้า",
    recommended: "สินค้าแนะนำ",
    allProducts: "สินค้าทั้งหมด",
    notFound: "ไม่พบสินค้าที่คุณค้นหา",
    cartTitle: "รายการที่สนใจ",
    cartEmpty: "ยังไม่มีสินค้าในรายการ",
    backToShop: "กลับไปเลือกสินค้า",
    alertMsg: "โปรดตรวจสอบรายการด้านล่าง และแคปเจอร์หน้าจอส่งให้แอดมินเพื่อเช็คสต็อกครับ/ค่ะ",
    contactTitle: "ข้อมูลติดต่อ (เลือกกรอกได้)",
    namePlaceholder: "ชื่อของคุณ",
    phonePlaceholder: "เบอร์โทรศัพท์ (ถ้ามี)",
    notePlaceholder: "หมายเหตุเพิ่มเติม",
    screenshotBtn: "สร้างรูปภาพสำหรับแคปเจอร์",
    addCart: "เพิ่มลงรายการ",
    screenshotTitle: "ใบสรุปรายการที่สนใจ",
    totalItems: "รวมทั้งหมด",
    priceNote: "*แอดมินจะแจ้งราคารวมและค่าจัดส่งให้ทราบอีกครั้งค่ะ/ครับ",
    exitScreenshot: "ออกจากโหมดแคปเจอร์",
    viewList: "ดูรายการที่สนใจ",
    added: "เพิ่มแล้ว ✓",
    inStock: "พร้อมส่ง",
    outOfStock: "สิ้นค้าหมด",
    submitOrder: "ส่งให้แอดมินเช็คสต็อก",
    orderSuccess: "ส่งข้อมูลสำเร็จแล้วครับ/ค่ะ!",
    copySuccess: "คัดลอกข้อความสำเร็จ!",
    skuPrefix: "SKU",
  },
  en: {
    searchPlaceholder: "Search products...",
    welcome: "Welcome to MOK 👋",
    welcomeSub: "Screenshot your selected items and send to admin for a quick quote!",
    categories: "Categories",
    recommended: "Recommended",
    allProducts: "All Products",
    notFound: "No products found",
    cartTitle: "Selected Items",
    cartEmpty: "Your list is empty",
    backToShop: "Back to shopping",
    alertMsg: "Please review your items below and screenshot to send to admin.",
    contactTitle: "Contact Info (Optional)",
    namePlaceholder: "Your Name",
    phonePlaceholder: "Phone Number",
    notePlaceholder: "Additional Notes",
    screenshotBtn: "Create Screenshot Image",
    addCart: "Add to List",
    screenshotTitle: "Inquiry Summary",
    totalItems: "Total items",
    priceNote: "*Admin will calculate final price including shipping.",
    exitScreenshot: "Exit Screenshot Mode",
    viewList: "View Selected List",
    added: "Added ✓",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    submitOrder: "Send to Admin",
    orderSuccess: "Sent successfully!",
    copySuccess: "Copied!",
    skuPrefix: "SKU",
  },
  zh: {
    searchPlaceholder: "搜索商品...",
    welcome: "您好，欢迎选购 👋",
    welcomeSub: "挑选意向商品并截图发给客服，即刻获取专属报价！",
    categories: "商品分类",
    recommended: "精选推荐",
    allProducts: "全部商品",
    notFound: "未找到相关商品",
    cartTitle: "意向清单",
    cartEmpty: "您的清单还是空的",
    backToShop: "返回选购",
    alertMsg: "请核对下方商品，并截图发送给客服。",
    contactTitle: "联系信息 (选填)",
    namePlaceholder: "您的姓名",
    phonePlaceholder: "联系电话",
    notePlaceholder: "备注说明",
    screenshotBtn: "生成专属截图",
    addCart: "加入清单",
    screenshotTitle: "意向采购清单",
    totalItems: "总件数",
    priceNote: "*客服将在收到截图后，为您核算最终价格与运费。",
    exitScreenshot: "退出截图模式",
    viewList: "查看已选清单",
    added: "已添加 ✓",
    inStock: "有货",
    outOfStock: "缺货",
    submitOrder: "发送给客服",
    orderSuccess: "发送成功！",
    copySuccess: "复制成功！",
    skuPrefix: "SKU",
  },
};

const CATS = [
  { id: "all", name_th: "ทั้งหมด", name_en: "All", name_zh: "全部" },
  { id: "cat_cabinet", name_th: "ตู้เอกสาร", name_en: "Filing Cabinet", name_zh: "文件柜" },
  { id: "cat_rack", name_th: "ชั้นวางของ", name_en: "Racks", name_zh: "货架" },
  { id: "cat_mirror", name_th: "กระจก", name_en: "Mirrors", name_zh: "镜子" },
  { id: "cat_bed", name_th: "เตียงเหล็ก", name_en: "Steel Bed", name_zh: "铁床" },
];

function getName(p: Product, lang: Lang) {
  if (lang === "th") return p.name_th;
  if (lang === "zh") return p.name_zh;
  return p.name_en || p.name_th;
}

function getTags(p: Product, lang: Lang) {
  if (lang === "th") return p.tags_th || [];
  if (lang === "zh") return p.tags_zh || [];
  return p.tags_en || p.tags_th || [];
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("th");
  const [view, setView] = useState<"home" | "cart">("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(PRODUCTS as Product[]);
  const [toast, setToast] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [orderSent, setOrderSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newProd, setNewProd] = useState({ category_id: "cat_cabinet", name_th: "", name_zh: "", sku: "", size: "", images: "" });

  function handleAdminLogin() {
    if (adminPwd === "admin123") { setShowAdmin(false); setShowAdminAuth(false); setShowAdmin(true); setAdminPwd(""); setAdminError(false); }
    else { setAdminError(true); }
  }

  function handleAddProduct() {
    if (!newProd.name_th || !newProd.sku) { showToastMsg("กรุณากรอกชื่อและ SKU"); return; }
    const id = "p_" + Date.now();
    const img = newProd.images || `https://placehold.co/600x600/e2e8f0/475569?text=${newProd.sku}`;
    const prod: Product = { id, category_id: newProd.category_id, name_th: newProd.name_th, name_en: newProd.name_th, name_zh: newProd.name_zh || newProd.name_th, sku: newProd.sku, size: newProd.size || "", images: [img], tags_th: ["พร้อมส่ง"], tags_en: ["In Stock"], tags_zh: ["有货"], featured: false, stock_status: "in_stock", sort_order: 999 };
    setProducts(prev => [...prev, prod]);
    setNewProd({ category_id: "cat_cabinet", name_th: "", name_zh: "", sku: "", size: "", images: "" });
    showToastMsg("บันทึกสินค้าสำเร็จ!");
  }

  function handleDeleteProduct(id: string) {
    if (!confirm("ยืนยันการลบสินค้านี้?")) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    showToastMsg("ลบสินค้าแล้ว");
  }

  function handleMoveProduct(id: string, dir: -1 | 1) {
    const idx = products.findIndex(p => p.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= products.length) return;
    const newProds = [...products];
    [newProds[idx], newProds[newIdx]] = [newProds[newIdx], newProds[idx]];
    setProducts(newProds);
  }

  function handleExportJSON() {
    const a = document.createElement("a"); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2)); a.download = "mok_products.json"; a.click();
  }

  const t = T[lang];

  useEffect(() => {
    setProducts(PRODUCTS as Product[]);
    // 尝试从 Firestore REST API 加载真实产品
    fetch("https://firestore.googleapis.com/v1/projects/th-mok/databases/(default)/documents/products?pageSize=100")
      .then(r => r.json())
      .then(data => {
        const docs = data.documents || [];
        if (!docs.length) return;
        const prods = docs.map((doc: any) => {
          const f = doc.fields || {};
          const p: any = { id: doc.name.split("/").pop() };
          for (const [k, v] of Object.entries(f)) {
            const val = v as any;
            if (val.stringValue !== undefined) p[k] = val.stringValue;
            else if (val.integerValue !== undefined) p[k] = Number(val.integerValue);
            else if (val.doubleValue !== undefined) p[k] = Number(val.doubleValue);
            else if (val.booleanValue !== undefined) p[k] = val.booleanValue;
            else if (val.arrayValue?.values) p[k] = val.arrayValue.values.map((x: any) => x.stringValue || x.integerValue);
          }
          return p as Product;
        });
        prods.sort((a: Product, b: Product) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
        setProducts(prods);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mok_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);

  function showToastMsg(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function syncCart(newCart: typeof cart) {
    setCart(newCart);
    try { localStorage.setItem("mok_cart", JSON.stringify(newCart)); } catch {}
  }

  async function addToCart(product: Product) {
    const existing = cart.find(i => i.product.id === product.id);
    let newCart: typeof cart;
    if (existing) {
      newCart = cart.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
    } else {
      newCart = [...cart, { product, qty: 1 }];
    }
    await syncCart(newCart);
    showToastMsg(t.added);
  }

  async function removeItem(productId: string) {
    await syncCart(cart.filter(i => i.product.id !== productId));
  }

  async function updateQty(productId: string, delta: number) {
    const newCart = cart
      .map(i => i.product.id === productId ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
      .filter(i => i.qty > 0);
    await syncCart(newCart);
  }

  async function submitOrder() {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const orders = JSON.parse(localStorage.getItem("mok_orders") || "[]");
      orders.unshift({
        name: customerName || "-",
        phone: customerPhone || "-",
        note: customerNote || "-",
        items: cart.map(i => ({ product_id: i.product.id, qty: i.qty, sku: i.product.sku, name: getName(i.product, lang) })),
        status: "pending",
        created_at: new Date().toISOString(),
      });
      localStorage.setItem("mok_orders", JSON.stringify(orders));
      await syncCart([]);
      setOrderSent(true);
      setCustomerName(""); setCustomerPhone(""); setCustomerNote("");
    } catch (e: any) {
      showToastMsg("发送失败: " + (e?.message || "请重试"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyText() {
    let text = `📦 ${t.cartTitle}\n`;
    cart.forEach((item, i) => {
      text += `${i + 1}. ${getName(item.product, lang)}\n  SKU: ${item.product.sku} | Qty: ${item.qty}\n`;
    });
    text += `\n${t.notePlaceholder}: ${customerNote || "-"}`;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToastMsg(t.copySuccess);
  }

  const filteredProducts = products.filter(p => {
    if (selectedCategory && p.category_id !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!getName(p, lang).toLowerCase().includes(q) && !p.sku?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const featuredProducts = filteredProducts.filter(p => p.featured);
  const regularProducts = filteredProducts.filter(p => !p.featured);

  // ======== RENDER =========
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-20 flex items-center gap-2 border-b border-slate-100 shadow-sm">
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-200 shrink-0">
          <img src={BRAND_LOGO_URL} alt="MOK" className="w-full h-full object-cover" />
        </div>
        <span className="font-black tracking-tight text-sm hidden sm:block" style={{ color: C.slate }}>MOK</span>
        <div className="flex flex-1 justify-end items-center gap-2">
          <div className="flex flex-1 items-center bg-slate-50 rounded-full px-3 py-1.5 border border-slate-200 max-w-[180px]">
            <Search size={13} className="text-slate-400 mr-1.5 shrink-0" />
            <input
              type="text" placeholder={t.searchPlaceholder}
              className="w-full bg-transparent text-[11px] text-slate-900 focus:outline-none placeholder-slate-400"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSelectedCategory(null); }}
            />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="text-slate-400 ml-1"><X size={11} /></button>}
          </div>
          <div className="flex items-center bg-white rounded-full border border-slate-200 shrink-0 overflow-hidden">
            {(["th","en","zh"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all ${lang === l ? "bg-blue-500 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                {l === "th" ? "ภาษาไทย" : l === "en" ? "EN" : "中文"}
              </button>
            ))}
          </div>
          <button onClick={() => setView("cart")}
            className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-full text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: C.blue }}>
            <ShoppingCart size={13} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {view === "home" ? (
        <div className="pb-28">
          {/* Welcome */}
          <div className="text-white px-5 py-4 rounded-b-[1.5rem] shadow-sm relative overflow-hidden" style={{ backgroundColor: C.slate }}>
            <div className="relative z-10">
              <h1 className="text-xl font-black mb-1 tracking-tight">{t.welcome}</h1>
              <p className="text-slate-300 text-xs font-light leading-snug max-w-[95%]">{t.welcomeSub}</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: C.blue }} />
          </div>

          {/* Categories */}
          <div className="mt-5 px-5">
            <div className="flex overflow-x-auto gap-2.5 pb-2" style={{ scrollbarWidth: "none" }}>
              {CATS.map(cat => (
                <button key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id === "all" ? null : cat.id); setSearchQuery(""); }}
                  className="flex items-center justify-center bg-white py-2 px-4 rounded-full border border-slate-200 hover:border-blue-300 shrink-0 shadow-sm">
                  <span className="text-xs text-slate-700 font-bold whitespace-nowrap">
                    {lang === "th" ? cat.name_th : lang === "zh" ? cat.name_zh : cat.name_en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured */}
          {featuredProducts.length > 0 && (
            <div className="px-5 mt-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.recommended}</p>
              <div className="grid grid-cols-2 gap-3">
                {featuredProducts.slice(0, 6).map(p => (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="relative aspect-square bg-gray-100 overflow-hidden"
                      onClick={() => { setSelectedProduct(p); setImgIdx(0); }}>
                      <img src={p.images?.[0] || p.image || `https://placehold.co/400?text=${p.sku}`}
                        alt={getName(p, lang)} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-white/90 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        {t.skuPrefix} {p.sku}
                      </div>
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1" style={{ fontFamily: "var(--font-kanit)" }}>
                        {getName(p, lang)}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">{p.size}</p>
                      <button onClick={() => addToCart(p)}
                        className="mt-auto w-full py-2 rounded-xl text-white text-sm font-semibold active:scale-95 transition-all"
                        style={{ backgroundColor: C.blue }}>
                        + {t.addCart}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Products */}
          <div className="px-5 mt-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.allProducts}</p>
            {regularProducts.length === 0 && filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-sm">{t.notFound}</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {regularProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="relative aspect-square bg-gray-100 overflow-hidden"
                      onClick={() => { setSelectedProduct(p); setImgIdx(0); }}>
                      <img src={p.images?.[0] || p.image || `https://placehold.co/400?text=${p.sku}`}
                        alt={getName(p, lang)} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-white/90 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                        {t.skuPrefix} {p.sku}
                      </div>
                      {(p.stock_status === "in_stock") && (
                        <div className="absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: C.orange }}>
                          {t.inStock}
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1" style={{ fontFamily: "var(--font-kanit)" }}>
                        {getName(p, lang)}
                      </h3>
                      <p className="text-xs text-gray-400 mb-2">{p.size}</p>
                      <button onClick={() => addToCart(p)}
                        className="mt-auto w-full py-2 rounded-xl text-white text-sm font-semibold active:scale-95 transition-all"
                        style={{ backgroundColor: C.blue }}>
                        + {t.addCart}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin */}
          <div className="px-5 mt-12 mb-10">
            {!showAdmin ? (
              <div>
                {showAdminAuth && (
                  <div className="bg-white rounded-2xl p-4 mb-2">
                    <input type="password" placeholder="รหัสผ่านแอดมิน" value={adminPwd}
                      onChange={e => { setAdminPwd(e.target.value); setAdminError(false); }}
                      className={`w-full border rounded-xl px-3 py-2 text-sm mb-2 ${adminError ? "border-red-400" : "border-slate-200"}`}
                      onKeyDown={e => e.key === "Enter" && handleAdminLogin()} />
                    {adminError && <p className="text-red-500 text-xs mb-2">รหัสผ่านไม่ถูกต้อง</p>}
                    <button onClick={handleAdminLogin} className="w-full bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold">เข้าสู่โหมดแอดมิน</button>
                  </div>
                )}
                <button onClick={() => setShowAdminAuth(!showAdminAuth)}
                  className="w-full text-center text-[11px] uppercase tracking-widest text-slate-400 py-3 flex items-center justify-center gap-1.5 hover:text-slate-600">
                  <Settings size={12} /> {showAdminAuth ? "ปิด" : "เข้าสู่โหมดแอดมิน"}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-gray-700 text-sm">⚙️ โหมดแอดมิน ({products.length} สินค้า)</p>
                  <button onClick={() => setShowAdmin(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                {/* Add Product Form */}
                <div className="bg-slate-50 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">+ เพิ่มสินค้าใหม่</p>
                  <div className="space-y-2">
                    <input value={newProd.name_th} onChange={e => setNewProd({ ...newProd, name_th: e.target.value })} placeholder="ชื่อสินค้า (TH)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                    <input value={newProd.name_zh} onChange={e => setNewProd({ ...newProd, name_zh: e.target.value })} placeholder="ชื่อสินค้า (ZH)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                    <input value={newProd.sku} onChange={e => setNewProd({ ...newProd, sku: e.target.value })} placeholder="SKU *" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                    <input value={newProd.size} onChange={e => setNewProd({ ...newProd, size: e.target.value })} placeholder="ขนาด (เช่น 85x39x180 cm)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                    <input value={newProd.images} onChange={e => setNewProd({ ...newProd, images: e.target.value })} placeholder="ลิงก์รูปภาพ" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                    <button onClick={handleAddProduct} className="w-full bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                      <Check size={14} /> บันทึกสินค้า
                    </button>
                  </div>
                </div>
                {/* Actions */}
                <button onClick={handleExportJSON} className="w-full bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 mb-3">
                  <Download size={12} /> Export JSON
                </button>
                {/* Product List */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {products.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-xs font-bold text-gray-300 w-5 text-center shrink-0">{i + 1}</span>
                      <img src={p.images?.[0] || p.image || `https://placehold.co/40?text=${p.sku}`} alt="" className="w-8 h-8 rounded object-cover bg-gray-200 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{p.name_th}</p>
                        <p className="text-[10px] text-gray-400">{p.sku}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => handleMoveProduct(p.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 rounded"><ArrowUp size={12} /></button>
                        <button onClick={() => handleMoveProduct(p.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 rounded"><ArrowDown size={12} /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="w-6 h-6 flex items-center justify-center text-red-300 hover:text-red-600 rounded"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CART VIEW */
        <div className="pb-28 px-5">
          <div className="flex items-center gap-3 py-4 border-b">
            <button onClick={() => setView("home")}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-semibold text-sm">
              <ChevronLeft size={18} /> {t.backToShop}
            </button>
            <span className="font-bold text-gray-800 flex-1">{t.cartTitle}</span>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-20 text-gray-400 text-sm">{t.cartEmpty}</div>
          ) : (
            <>
              <div className="mt-4 space-y-3">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-white rounded-xl p-3 flex gap-3 items-center shadow-sm">
                    <img src={item.product.images?.[0] || item.product.image || `https://placehold.co/80?text=${item.product.sku}`}
                      alt={getName(item.product, lang)} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{getName(item.product, lang)}</p>
                      <p className="text-xs text-gray-400">{t.skuPrefix} {item.product.sku}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"><Minus size={12} /></button>
                        <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.product.id, 1)} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center"><Plus size={12} /></button>
                        <button onClick={() => removeItem(item.product.id)} className="ml-auto text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact */}
              <div className="mt-6 bg-white rounded-xl p-4">
                <p className="font-bold text-gray-700 text-sm mb-3">{t.contactTitle}</p>
                <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                  placeholder={t.namePlaceholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2" />
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  placeholder={t.phonePlaceholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2" />
                <textarea value={customerNote} onChange={e => setCustomerNote(e.target.value)}
                  placeholder={t.notePlaceholder} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 resize-none" />
                <button onClick={handleCopyText} className="w-full bg-slate-800 text-white py-2.5 rounded-xl text-sm font-semibold mb-2">
                  📋 {t.screenshotBtn}
                </button>
                <button onClick={submitOrder} disabled={submitting}
                  className="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-60"
                  style={{ backgroundColor: C.blue }}>
                  {submitting ? "..." : t.submitOrder}
                </button>
                {orderSent && <p className="text-green-500 text-sm text-center mt-2 font-semibold">{t.orderSuccess}</p>}
                <p className="text-xs text-gray-400 text-center mt-2">{t.priceNote}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedProduct(null)} />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow">
              <X size={16} className="text-gray-600" />
            </button>
            <div className="aspect-square bg-gray-100 relative">
              <img src={selectedProduct.images?.[0] || selectedProduct.image || `https://placehold.co/600?text=${selectedProduct.sku}`}
                alt={getName(selectedProduct, lang)} className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">{t.skuPrefix} {selectedProduct.sku}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold text-white ${selectedProduct.stock_status === "in_stock" ? "bg-green-500" : "bg-red-400"}`}>
                  {selectedProduct.stock_status === "in_stock" ? t.inStock : t.outOfStock}
                </span>
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-1" style={{ fontFamily: "var(--font-kanit)" }}>
                {getName(selectedProduct, lang)}
              </h2>
              <p className="text-sm text-gray-500 mb-3">📐 {selectedProduct.size}</p>
              {getTags(selectedProduct, lang).map(tag => (
                <span key={tag} className="inline-block text-xs mr-1 mb-2 px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: C.orange }}>{tag}</span>
              ))}
              <button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); setView("cart"); }}
                className="mt-4 w-full py-3 rounded-xl text-white font-bold text-base active:scale-95 transition-all"
                style={{ backgroundColor: C.blue }}>
                + {t.addCart}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
