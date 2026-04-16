"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search, ShoppingCart, X, Plus, Minus, CheckCircle2,
  Camera, Copy, MessageCircle, ChevronLeft, Globe,
  Settings, Trash2, Download, ArrowUp, ArrowDown,
  Check, Box, FileText, Archive, Maximize2, Package, Grid
} from "lucide-react";
import Image from "next/image";
import { collection, getDocs, doc, setDoc, getDoc, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Product, Category, Cart, Lang } from "@/lib/types";
import { PRODUCTS } from "@/data/products";

// ==========================================
// 品牌配置
// ==========================================
const BRAND_LOGO_URL = "https://pub-6fec257ce1fa5321a4fa21e2d8e87438.r2.cloudflarestorage.com/products/logo.jpg";
const C = { blue: "#008AD8", orange: "#E86A1A", green: "#38A959", slate: "#0f172a" };

// ==========================================
// 多语言字典
// ==========================================
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
    notePlaceholder: "หมายเหตุเพิ่มเติม (เช่น ต้องการสีดำ, ระยะทางจัดส่ง...)",
    screenshotBtn: "สร้างรูปภาพสำหรับแคปเจอร์",
    copyBtn: "คัดลอกข้อความ",
    lineBtn: "ส่งให้ LINE",
    size: "ขนาด",
    detail: "รายละเอียด",
    addCart: "เพิ่มลงรายการ",
    screenshotTitle: "ใบสรุปรายการที่สนใจ",
    screenshotSub: "อ้างอิงเพื่อเช็คสต็อกและประเมินราคา",
    totalItems: "รวมทั้งหมด",
    priceNote: "*แอดมินจะแจ้งราคารวมและค่าจัดส่งให้ทราบอีกครั้งค่ะ/ครับ",
    exitScreenshot: "ออกจากโหมดแคปเจอร์",
    viewList: "ดูรายการที่สนใจ",
    clickToView: "คลิกเพื่อสรุปและแคปส่งแอดมิน",
    copySuccess: "คัดลอกข้อความสำเร็จ! นำไปวางใน LINE ได้เลยครับ/ค่ะ",
    skuPrefix: "SKU",
    added: "เพิ่มแล้ว ✓",
    enterAdmin: "เข้าสู่โหมดแอดมิน",
    adminPwdPlaceholder: "รหัสผ่านแอดมิน",
    wrongPwd: "รหัสผ่านไม่ถูกต้อง",
    closeAdmin: "ปิดโหมดแอดมิน",
    addProduct: "เพิ่มสินค้าใหม่",
    productNameTh: "ชื่อสินค้า (TH)",
    productNameZh: "ชื่อสินค้า (ZH)",
    productSku: "SKU",
    productSize: "ขนาด",
    productCategory: "หมวดหมู่",
    productImage: "ลิงก์รูปภาพ",
    saveProduct: "บันทึกสินค้า",
    productSaved: "บันทึกสินค้าสำเร็จ!",
    fillRequired: "กรุณากรอกชื่อและ SKU",
    exportJson: "ส่งออก JSON",
    resetProducts: "รีเซ็ตเป็นค่าเริ่มต้น",
    confirmDelete: "ยืนยันการลบสินค้านี้?",
    deleteSuccess: "ลบสินค้าแล้ว",
    noProducts: "ยังไม่มีสินค้าในหมวดนี้",
    inStock: "พร้อมส่ง",
    outOfStock: "สินค้าหมด",
    submitOrder: "ส่งให้แอดมินเช็คสต็อก",
    orderSuccess: "ส่งข้อมูลสำเร็จแล้วครับ/ค่ะ! แอดมินจะติดต่อกลับเร็วๆ นี้",
    required: "จำเป็น *",
    category: "หมวดหมู่",
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
    notePlaceholder: "Additional Notes (e.g. color, delivery area...)",
    screenshotBtn: "Create Screenshot Image",
    copyBtn: "Copy Text",
    lineBtn: "Send to LINE",
    size: "Size",
    detail: "Details",
    addCart: "Add to List",
    screenshotTitle: "Inquiry Summary",
    screenshotSub: "For stock check and quotation",
    totalItems: "Total items",
    priceNote: "*Admin will calculate final price including shipping.",
    exitScreenshot: "Exit Screenshot Mode",
    viewList: "View Selected List",
    clickToView: "Click to review and screenshot",
    copySuccess: "Copied! Paste in LINE to send.",
    skuPrefix: "SKU",
    added: "Added ✓",
    enterAdmin: "Enter Admin Mode",
    adminPwdPlaceholder: "Admin password",
    wrongPwd: "Wrong password",
    closeAdmin: "Close Admin Mode",
    addProduct: "Add New Product",
    productNameTh: "Product Name (TH)",
    productNameZh: "Product Name (ZH)",
    productSku: "SKU",
    productSize: "Size",
    productCategory: "Category",
    productImage: "Image URL",
    saveProduct: "Save Product",
    productSaved: "Product saved!",
    fillRequired: "Please fill in name and SKU",
    exportJson: "Export JSON",
    resetProducts: "Reset to Default",
    confirmDelete: "Confirm delete this product?",
    deleteSuccess: "Product deleted",
    noProducts: "No products in this category",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    submitOrder: "Send to Admin",
    orderSuccess: "Sent successfully! Admin will contact you soon.",
    required: "Required *",
    category: "Category",
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
    alertMsg: "请核对下方商品，并截图发送给客服，我们将为您核算运费与最终报价。",
    contactTitle: "联系信息 (选填)",
    namePlaceholder: "您的姓名",
    phonePlaceholder: "联系电话",
    notePlaceholder: "备注说明 (如：送货区域、指定颜色等)",
    screenshotBtn: "生成专属截图",
    copyBtn: "复制文本",
    lineBtn: "发送至 LINE",
    size: "尺寸",
    detail: "商品详情",
    addCart: "加入清单",
    screenshotTitle: "意向采购清单",
    screenshotSub: "仅供核对库存与计算运费使用",
    totalItems: "总件数",
    priceNote: "*客服将在收到截图后，为您核算最终价格与运费。",
    exitScreenshot: "退出截图模式",
    viewList: "查看已选清单",
    clickToView: "点击生成截图发给客服",
    copySuccess: "复制成功！请前往 LINE 粘贴发送给客服。",
    skuPrefix: "SKU",
    added: "已添加 ✓",
    enterAdmin: "进入后台管理",
    adminPwdPlaceholder: "管理员密码",
    wrongPwd: "密码错误",
    closeAdmin: "关闭后台模式",
    addProduct: "添加新商品",
    productNameTh: "商品名称 (泰)",
    productNameZh: "商品名称 (中)",
    productSku: "SKU",
    productSize: "尺寸",
    productCategory: "分类",
    productImage: "图片链接",
    saveProduct: "保存商品",
    productSaved: "商品保存成功！",
    fillRequired: "请填写名称和SKU",
    exportJson: "导出 JSON",
    resetProducts: "恢复默认",
    confirmDelete: "确定删除此商品？",
    deleteSuccess: "商品已删除",
    noProducts: "该分类暂无商品",
    inStock: "有货",
    outOfStock: "缺货",
    submitOrder: "发送给客服",
    orderSuccess: "发送成功！客服将尽快与您联系。",
    required: "必填 *",
    category: "分类",
  },
};

// ==========================================
// 分类数据
// ==========================================
const CATS = [
  { id: "all", name_th: "ทั้งหมด", name_en: "All", name_zh: "全部" },
  { id: "cat_cabinet", name_th: "ตู้เอกสาร", name_en: "Filing Cabinet", name_zh: "文件柜" },
  { id: "cat_rack", name_th: "ชั้นวางของ", name_en: "Racks", name_zh: "货架" },
  { id: "cat_mirror", name_th: "กระจก", name_en: "Mirrors", name_zh: "镜子" },
  { id: "cat_wardrobe", name_th: "ตู้เสื้อผ้า", name_en: "Wardrobe", name_zh: "衣柜" },
  { id: "cat_bed", name_th: "เตียงเหล็ก", name_en: "Steel Bed", name_zh: "铁床" },
  { id: "cat_storage", name_th: "ตู้เก็บของ", name_en: "Storage", name_zh: "橱柜" },
  { id: "cat_table", name_th: "โต๊ะ", name_en: "Table", name_zh: "桌子" },
];

function gp(obj: Record<string, string>, lang: Lang, fallback = "th") {
  const key = `${obj}_${lang}`;
  return (obj as any)[key] || (obj as any)[`${obj}_${fallback}`] || "";
}

// ==========================================
// 主应用组件
// ==========================================
function MOKApp() {
  const { user, loading: authLoading } = useAuth();
  const [lang, setLang] = useState<Lang>("th");
  const [view, setView] = useState<"home" | "category" | "product" | "cart">("home");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Admin 状态
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [newProd, setNewProd] = useState({
    category_id: "cat_cabinet", name_th: "", name_zh: "", sku: "",
    size: "", images: "",
  });

  // 客户信息
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [orderSent, setOrderSent] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const t = T[lang];
  const scrollRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // 加载产品数据（Firestore，持久保存）
  // ==========================================
  useEffect(() => {
    async function loadProducts() {
      try {
        const snap = await getDocs(collection(db, "products"));
        if (snap.empty) {
          // Firestore 为空则降级到静态文件
          setProducts(PRODUCTS as Product[]);
        } else {
          const prods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
          prods.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
          setProducts(prods);
        }
      } catch (e) {
        console.error("Firestore load error:", e);
        setProducts(PRODUCTS as Product[]);
      }
      setLoading(false);
    }
    loadProducts();
  }, []);

  // ==========================================
  // 加载购物车
  // ==========================================
  useEffect(() => {
    if (!user) return;
    async function loadCart() {
      const uid = user!.uid;
      const snap = await getDoc(doc(db, "carts", uid));
      if (snap.exists()) {
        const data = snap.data() as Cart;
        // 把 product_id 转成完整 product 对象
        const ids = data.items.map(i => i.product_id);
        if (ids.length === 0) return;
        const prodsnap = await getDocs(query(collection(db, "products")));
        const prodMap: Record<string, Product> = {};
        prodsnap.docs.forEach(d => { prodMap[d.id] = { id: d.id, ...d.data() } as Product; });
        const cartItems = data.items
          .map(i => ({ product: prodMap[i.product_id], qty: i.qty }))
          .filter(i => i.product);
        setCart(cartItems);
      }
    }
    loadCart();
  }, [user]);

  // ==========================================
  // 工具函数
  // ==========================================
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  useEffect(() => { setImgIdx(0); }, [selectedProduct]);

  async function syncCart(newCart: typeof cart) {
    if (!user) return;
    setCart(newCart);
    await setDoc(doc(db, "carts", user!.uid), {
      items: newCart.map(i => ({ product_id: i.product.id, qty: i.qty })),
      updated_at: serverTimestamp(),
    }, { merge: true });
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
    showToast(t.added);
  }

  async function updateQty(productId: string, delta: number) {
    const newCart = cart
      .map(i => i.product.id === productId ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
      .filter(i => i.qty > 0);
    await syncCart(newCart);
  }

  async function removeItem(productId: string) {
    const newCart = cart.filter(i => i.product.id !== productId);
    await syncCart(newCart);
  }

  function getName(p: Product) {
    if (lang === "th") return p.name_th;
    if (lang === "zh") return p.name_zh;
    return p.name_en;
  }

  function getTags(p: Product) {
    if (lang === "th") return p.tags_th;
    if (lang === "zh") return p.tags_zh;
    return p.tags_en;
  }

  // 过滤产品
  const filteredProducts = products.filter(p => {
    if (selectedCategory && p.category_id !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!getName(p).toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const featuredProducts = filteredProducts.filter(p => p.featured);
  const allShown = filteredProducts;

  // ==========================================
  // Admin 功能
  // ==========================================
  function handleAdminLogin() {
    if (adminPwd === "admin123") {
      setShowAdmin(false);
      setShowAdminAuth(false);
      setShowAdmin(true);
      setAdminPwd("");
      setAdminError(false);
    } else {
      setAdminError(true);
    }
  }

  async function handleAddProduct() {
    if (!newProd.name_th || !newProd.sku) {
      showToast(t.fillRequired);
      return;
    }
    const id = "p_" + Date.now();
    const img = newProd.images || `https://placehold.co/600x600/e2e8f0/475569?text=${newProd.sku}`;
    const prod: Product = {
      id, category_id: newProd.category_id,
      name_th: newProd.name_th, name_en: newProd.name_th, name_zh: newProd.name_zh || newProd.name_th,
      sku: newProd.sku, size: newProd.size || "",
      images: [img],
      tags_th: ["พร้อมส่ง"], tags_en: ["In Stock"], tags_zh: ["有货"],
      featured: false, stock_status: "in_stock",
      sort_order: 999,
    };
    try {
      await setDoc(doc(db, "products", id), prod);
      setProducts(prev => [...prev, prod]);
      setNewProd({ category_id: "cat_cabinet", name_th: "", name_zh: "", sku: "", size: "", images: "" });
      showToast(t.productSaved);
    } catch (e: any) {
      showToast("บันทึกล้มเหลว: " + (e?.message || e));
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm(t.confirmDelete)) return;
    await import("firebase/firestore").then(({ deleteDoc }) => deleteDoc(doc(db, "products", id)));
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast(t.deleteSuccess);
  }

  async function handleMoveProduct(id: string, dir: -1 | 1) {
    const idx = products.findIndex(p => p.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= products.length) return;
    const newProds = [...products];
    [newProds[idx], newProds[newIdx]] = [newProds[newIdx], newProds[idx]];
    // 写回 Firestore
    await Promise.all(newProds.map((p, i) => setDoc(doc(db, "products", p.id), { sort_order: i }, { merge: true })));
    setProducts(newProds);
  }

  async function handleExportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const a = document.createElement("a");
    a.href = dataStr; a.download = "mok_products.json"; a.click();
  }

  async function submitOrder() {
    if (!user || cart.length === 0) return;
    const uid = user.uid;
    await addDoc(collection(db, "orders"), {
      user_id: uid,
      name: customerName,
      phone: customerPhone,
      note: customerNote,
      items: cart.map(i => ({ product_id: i.product.id, qty: i.qty })),
      status: "pending",
      created_at: new Date().toISOString(),
    });
    // 清空购物车
    await syncCart([]);
    setOrderSent(true);
  }

  function handleCopyText() {
    let text = `📦 ${t.cartTitle} (${t.namePlaceholder}: ${customerName || "-"}) \n`;
    text += `${t.phonePlaceholder}: ${customerPhone || "-"}\n\n`;
    cart.forEach((item, i) => {
      text += `${i + 1}. ${getName(item.product)}\n`;
      text += ` ${t.skuPrefix}: ${item.product.sku} | Qty: ${item.qty}\n`;
    });
    text += `\n${t.notePlaceholder}: ${customerNote || "-"}`;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(t.copySuccess);
  }

  // ==========================================
  // 品牌 Logo
  // ==========================================
  function BrandLogo({ className = "w-8 h-8" }: { className?: string }) {
    return (
      <div className={`relative ${className} rounded-lg overflow-hidden`}>
        <img src={BRAND_LOGO_URL} alt="MOK" className="w-full h-full object-cover" />
      </div>
    );
  }

  // ==========================================
  // 产品卡片
  // ==========================================
  function ProductCard({ product, onClick, showAdminControls = false }: {
    product: Product;
    onClick?: () => void;
    showAdminControls?: boolean;
  }) {
    const tags = getTags(product);
    const [imgIdx, setImgIdx] = useState(0);
    const imgCount = product.images?.length || 0;

    return (
      <div
        className="bg-white rounded-2xl shadow-sm overflow-hidden product-card cursor-pointer flex flex-col"
        onClick={onClick}
      >
        <div
          className="relative aspect-square bg-gray-100 overflow-hidden"
          onMouseEnter={() => imgCount > 1 && setImgIdx(1)}
          onMouseLeave={() => setImgIdx(0)}
        >
          <img
            src={product.images?.[imgIdx] || `https://placehold.co/400?text=${product.sku}`}
            alt={getName(product)}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          {/* SKU 角标 */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            {t.skuPrefix} {product.sku}
          </div>
          {/* 标签 */}
          {tags[0] && (
            <div
              className="absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow"
              style={{ backgroundColor: C.orange }}
            >
              {tags[0]}
            </div>
          )}
          {/* 图片数量指示 */}
          {imgCount > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {Array.from({ length: imgCount }).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-white w-3" : "bg-white/50"}`} />
              ))}
            </div>
          )}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1" style={{ fontFamily: "var(--font-kanit)" }}>
            {getName(product)}
          </h3>
          <p className="text-xs text-gray-400 mb-2">{product.size}</p>
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className="mt-auto w-full py-2 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
            style={{ backgroundColor: C.blue }}
          >
            + {t.addCart}
          </button>
        </div>
        {showAdminControls && (
          <div className="flex items-center justify-between px-3 pb-2 gap-1">
            <button onClick={(e) => { e.stopPropagation(); handleMoveProduct(product.id, -1); }}
              className="p-1 text-gray-400 hover:text-gray-700"><ArrowUp size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
              className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            <button onClick={(e) => { e.stopPropagation(); handleMoveProduct(product.id, 1); }}
              className="p-1 text-gray-400 hover:text-gray-700"><ArrowDown size={14} /></button>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 产品详情弹窗
  // ==========================================
  function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/50 modal-backdrop" onClick={onClose} />
        <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto animate-in">
          <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow">
            <X size={16} className="text-gray-600" />
          </button>
          <div className="aspect-square bg-gray-100 relative">
            <img src={product.images?.[0] || `https://placehold.co/600?text=${product.sku}`}
              alt={getName(product)} className="w-full h-full object-cover" />
          </div>
          <div className="p-5">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                {t.skuPrefix} {product.sku}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold text-white ${product.stock_status === "in_stock" ? "bg-green-500" : "bg-red-400"}`}>
                {product.stock_status === "in_stock" ? t.inStock : t.outOfStock}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "var(--font-kanit)" }}>
              {getName(product)}
            </h2>
            <p className="text-sm text-gray-500 mb-3">📐 {t.size}: {product.size}</p>
            {getTags(product).map(tag => (
              <span key={tag} className="inline-block text-xs mr-1 mb-2 px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: C.orange }}>
                {tag}
              </span>
            ))}
            <button
              onClick={() => { addToCart(product); onClose(); }}
              className="mt-4 w-full py-3 rounded-xl text-white font-bold text-base transition-all active:scale-95"
              style={{ backgroundColor: C.blue }}
            >
              + {t.addCart}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Toast
  // ==========================================
  function Toast() {
    if (!toast) return null;
    return (
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-2.5 rounded-full shadow-lg animate-in">
        {toast}
      </div>
    );
  }

  // ==========================================
  // 视图渲染
  // ==========================================
  function renderHome() {
    return (
      <div className="pb-28 animate-in">
        {/* Header */}
        <div className="bg-white px-4 py-3 sticky top-0 z-20 flex items-center gap-2 border-b border-slate-100 shadow-sm">
          <BrandLogo className="w-7 h-7" />
          <span className="font-black tracking-tight text-sm hidden sm:block" style={{ color: C.slate }}>MOK</span>
          <div className="flex flex-1 justify-end items-center gap-2">
            <div className="flex flex-1 items-center bg-slate-50 rounded-full px-3 py-1.5 border border-slate-200 max-w-[180px]">
              <Search size={13} className="text-slate-400 mr-1.5 shrink-0" />
              <input
                type="text" placeholder={t.searchPlaceholder}
                className="w-full bg-transparent text-[11px] text-slate-900 focus:outline-none placeholder-slate-400"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSelectedCategory(null); setView("home"); }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-slate-400 ml-1"><X size={11} /></button>
              )}
            </div>
            {/* 语言切换 */}
            <div className="flex items-center bg-white rounded-full border border-slate-200 shrink-0 overflow-hidden">
              {(["th","en","zh"] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all ${
                    lang === l
                      ? "bg-blue-500 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {l === "th" ? "ภาษาไทย" : l === "en" ? "EN" : "中文"}
                </button>
              ))}
            </div>
            {/* 购物车按钮 */}
            <button
              onClick={() => setView("cart")}
              className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-full text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: C.blue }}
            >
              <ShoppingCart size={13} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cart.reduce((s: number, i: { qty: number }) => s + i.qty, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="text-white px-5 py-4 rounded-b-[1.5rem] shadow-sm relative overflow-hidden" style={{ backgroundColor: C.slate }}>
          <div className="relative z-10">
            <h1 className="text-xl font-black mb-1 tracking-tight">{t.welcome}</h1>
            <p className="text-slate-300 text-xs font-light leading-snug max-w-[95%]">{t.welcomeSub}</p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: C.blue }} />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: C.green }} />
        </div>

        {/* Category Scroll */}
        <div className="mt-5">
          <div ref={scrollRef} className="flex overflow-x-auto gap-2.5 px-5 pb-2 hide-scrollbar" style={{ scrollbarWidth: "none" }}>
            {CATS.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id === "all" ? null : cat.id); setSearchQuery(""); setView("category"); }}
                className="flex items-center justify-center bg-white py-2 px-4 rounded-full border border-slate-200 hover:border-blue-300 cat-pill shrink-0 shadow-sm"
              >
                <span className="text-xs text-slate-700 font-bold whitespace-nowrap">
                  {lang === "th" ? cat.name_th : lang === "zh" ? cat.name_zh : cat.name_en}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="px-5 mt-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.recommended}</p>
          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.slice(0, 6).map(p => (
              <ProductCard key={p.id} product={p} onClick={() => { setSelectedProduct(p); setView("product"); }} />
            ))}
          </div>
        </div>

        {/* All Products */}
        <div className="px-5 mt-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.allProducts}</p>
          <div className="grid grid-cols-2 gap-3">
            {allShown.filter(p => !p.featured).map(p => (
              <ProductCard key={p.id} product={p} onClick={() => { setSelectedProduct(p); setView("product"); }} />
            ))}
          </div>
          {allShown.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">{t.notFound}</div>
          )}
        </div>

        {/* Admin Bar */}
        <div className="px-5 mt-12 mb-10">
          {!showAdmin ? (
            <div>
              {showAdminAuth && (
                <div className="bg-white rounded-2xl p-4 mb-2 animate-in">
                  <input
                    type="password" placeholder={t.adminPwdPlaceholder}
                    value={adminPwd}
                    onChange={e => { setAdminPwd(e.target.value); setAdminError(false); }}
                    className={`w-full border rounded-xl px-3 py-2 text-sm mb-2 ${adminError ? "border-red-400" : "border-slate-200"}`}
                    onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                  />
                  {adminError && <p className="text-red-500 text-xs mb-2">{t.wrongPwd}</p>}
                  <button onClick={handleAdminLogin} className="w-full bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold">
                    {t.enterAdmin}
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowAdminAuth(!showAdminAuth)}
                className="w-full text-center text-[11px] uppercase tracking-widest text-slate-400 py-3 flex items-center justify-center gap-1.5 hover:text-slate-600"
              >
                <Settings size={12} /> {showAdminAuth ? t.closeAdmin : t.enterAdmin}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-gray-700 text-sm">⚙️ {t.enterAdmin}</p>
                <button onClick={() => setShowAdmin(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
              </div>

              {/* Add Product Form */}
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-3">{t.addProduct}</p>
                <div className="space-y-2">
                  <input value={newProd.name_th} onChange={e => setNewProd({ ...newProd, name_th: e.target.value })} placeholder={t.productNameTh}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                  <input value={newProd.name_zh} onChange={e => setNewProd({ ...newProd, name_zh: e.target.value })} placeholder={t.productNameZh}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                  <input value={newProd.sku} onChange={e => setNewProd({ ...newProd, sku: e.target.value })} placeholder={t.productSku}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                  <input value={newProd.size} onChange={e => setNewProd({ ...newProd, size: e.target.value })} placeholder={t.productSize}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                  <select value={newProd.category_id} onChange={e => setNewProd({ ...newProd, category_id: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white">
                    {CATS.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.name_th}</option>)}
                  </select>
                  <input value={newProd.images} onChange={e => setNewProd({ ...newProd, images: e.target.value })} placeholder={t.productImage}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                  <button onClick={handleAddProduct}
                    className="w-full bg-blue-500 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                    <Check size={14} /> {t.saveProduct}
                  </button>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex gap-2">
                <button onClick={handleExportJSON} className="flex-1 bg-slate-800 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                  <Download size={12} /> {t.exportJson}
                </button>
              </div>

              {/* Product List */}
              <p className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">{t.allProducts} ({products.length}) — ลาก arrow เพื่อเรียงลำดับ</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {products.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-xs font-bold text-gray-300 w-5 text-center shrink-0">{(p as any).sort_order || i + 1}</span>
                    <img src={p.images?.[0] || `https://placehold.co/40?text=${p.sku}`} alt="" className="w-8 h-8 rounded object-cover bg-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{p.name_th}</p>
                      <p className="text-[10px] text-gray-400">{p.sku}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => handleMoveProduct(p.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 rounded" title="往上移"><ArrowUp size={12} /></button>
                      <button onClick={() => handleMoveProduct(p.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-600 rounded" title="往下移"><ArrowDown size={12} /></button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="w-6 h-6 flex items-center justify-center text-red-300 hover:text-red-600 rounded"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCategory() {
    const catProducts = products.filter(p => !selectedCategory || p.category_id === selectedCategory);
    const cat = CATS.find(c => c.id === (selectedCategory || "all"));
    return (
      <div className="pb-28 animate-in" style={{ display: view === 'product' ? 'none' : 'block' }}>
        <div className="bg-white px-4 py-3 sticky top-0 z-20 flex items-center gap-3 border-b shadow-sm">
          <button
            onClick={() => { setView("home"); setSelectedCategory(null); }}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-semibold text-sm px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <ChevronLeft size={18} />
            <span>← หน้าแรก</span>
          </button>
          <p className="font-bold text-gray-800 flex-1">{cat?.name_th || t.categories}</p>
          <button onClick={() => setView("cart")} className="relative">
            <ShoppingCart size={20} style={{ color: C.blue }} />
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.allProducts}</p>
          {catProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">{t.noProducts}</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {catProducts.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => { setSelectedProduct(p); setView("product"); }} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderCart() {
    if (orderSent) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center animate-in">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{t.orderSuccess}</h2>
          <button onClick={() => { setOrderSent(false); setView("home"); setCustomerName(""); setCustomerPhone(""); setCustomerNote(""); }}
            className="mt-6 px-6 py-3 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: C.blue }}>
            ← {t.backToShop}
          </button>
        </div>
      );
    }

    return (
      <div className="pb-32 animate-in">
        {/* Header */}
        <div className="bg-white px-4 py-3 sticky top-0 z-20 flex items-center gap-3 border-b shadow-sm">
          <button onClick={() => setView("home")} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={20} />
          </button>
          <p className="font-bold text-gray-800 flex-1">{t.cartTitle}</p>
          {cart.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((s, i) => s + i.qty, 0)} {t.totalItems}
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-gray-400 text-sm">{t.cartEmpty}</p>
            <button onClick={() => setView("home")} className="mt-4 text-sm font-semibold" style={{ color: C.blue }}>
              ← {t.backToShop}
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="px-4 py-4 space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="bg-white rounded-xl p-3 flex gap-3 shadow-sm">
                  <img
                    src={item.product.images?.[0] || `https://placehold.co/80?text=${item.product.sku}`}
                    alt={getName(item.product)}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{getName(item.product)}</p>
                    <p className="text-xs text-gray-400">{t.skuPrefix} {item.product.sku}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.product.size}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(item.product.id)} className="text-gray-300 hover:text-red-400">
                      <X size={14} />
                    </button>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-full px-2 py-1">
                      <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full bg-white shadow-sm">
                        <Minus size={11} />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full bg-white shadow-sm">
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Alert */}
            <div className="mx-4 mb-4 bg-blue-50 border border-blue-100 rounded-xl p-3">
              <p className="text-xs text-blue-700 leading-relaxed">💡 {t.alertMsg}</p>
            </div>

            {/* Customer Form */}
            <div className="px-4 space-y-3 mb-4">
              <h3 className="font-bold text-gray-700 text-sm">{t.contactTitle}</h3>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={t.namePlaceholder}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white" />
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder={t.phonePlaceholder}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white" />
              <textarea value={customerNote} onChange={e => setCustomerNote(e.target.value)} placeholder={t.notePlaceholder}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white resize-none" rows={2} />
            </div>

            {/* Action Buttons */}
            <div className="px-4 space-y-2">
              <button onClick={handleCopyText}
                className="w-full py-3 rounded-xl border-2 border-slate-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2">
                <Copy size={14} /> {t.copyBtn}
              </button>
              <a href={`https://line.me/ti/p/~639isuyr`} target="_blank"
                className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: C.green }}>
                <MessageCircle size={14} /> {t.lineBtn}
              </a>
              <button onClick={submitOrder}
                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: C.blue }}>
                <CheckCircle2 size={14} /> {t.submitOrder}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ==========================================
  // ==========================================
  // 骨架屏加载
  // ==========================================
  function Skeleton() {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header skeleton */}
        <div className="bg-white px-4 py-3 flex items-center gap-2 border-b shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-slate-200 animate-pulse" />
          <div className="w-10 h-4 rounded bg-slate-200 animate-pulse ml-1" />
          <div className="flex-1" />
          <div className="w-20 h-7 rounded-full bg-slate-200 animate-pulse" />
        </div>
        {/* Welcome skeleton */}
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-slate-800 animate-pulse" style={{ height: 100 }} />
        {/* Category pills skeleton */}
        <div className="flex gap-2 px-4 mt-4 overflow-hidden">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-8 w-20 rounded-full bg-slate-200 animate-pulse" />
          ))}
        </div>
        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden">
              <div className="aspect-square bg-slate-200 animate-pulse" />
              <div className="p-3">
                <div className="h-4 rounded bg-slate-200 animate-pulse mb-2" />
                <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse mb-3" />
                <div className="h-8 rounded-xl bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (authLoading || loading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "var(--font-kanit)" }}>

      {/* Views */}
      {view === "home" && renderHome()}
      {view === "category" && renderCategory()}
      {view === "cart" && renderCart()}

      {/* Product Modal overlay - 图片轮播详情 */}
      {view === "product" && selectedProduct && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setView("home")} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto animate-in">
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-3 border-b">
              <button
                onClick={() => setView(selectedCategory ? "category" : "home")}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-semibold text-sm px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <ChevronLeft size={18} />
                <span>← กลับ</span>
              </button>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedProduct.sku}</span>
            </div>
            {/* 图片轮播 */}
            <div className="relative bg-gray-100">
              <div className="aspect-square overflow-hidden">
                <img
                  src={selectedProduct.images?.[imgIdx] || `https://placehold.co/600?text=${selectedProduct.sku}`}
                  alt={getName(selectedProduct)}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              </div>
              {/* 多图导航 */}
              {(selectedProduct.images?.length || 0) > 1 && (
                <>
                  <button
                    onClick={() => setImgIdx(i => (i - 1 + (selectedProduct.images?.length || 1)) % (selectedProduct.images?.length || 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white active:scale-90 transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setImgIdx(i => (i + 1) % (selectedProduct.images?.length || 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-white active:scale-90 transition-all"
                  >
                    <ChevronLeft size={18} className="rotate-180" />
                  </button>
                  {/* 指示点 */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {selectedProduct.images?.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === imgIdx ? "bg-white w-4 shadow" : "bg-white/50 w-1.5"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* 产品信息 */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold text-white ${selectedProduct.stock_status === "in_stock" ? "bg-green-500" : "bg-red-400"}`}>
                  {selectedProduct.stock_status === "in_stock" ? t.inStock : t.outOfStock}
                </span>
                {getTags(selectedProduct).map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full text-white font-semibold" style={{ backgroundColor: C.orange }}>{tag}</span>
                ))}
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: "var(--font-kanit)" }}>
                {getName(selectedProduct)}
              </h2>
              <p className="text-sm text-gray-500 mb-1">📐 {t.size}: <span className="font-semibold">{selectedProduct.size}</span></p>
              <div className="h-px bg-slate-100 my-4" />
              <button
                onClick={() => { addToCart(selectedProduct); setView("cart"); }}
                className="w-full py-3.5 rounded-xl text-white font-bold text-base active:scale-95 transition-transform"
                style={{ backgroundColor: C.blue }}
              >
                + {t.addCart}
              </button>
              <button onClick={() => setView("cart")} className="w-full mt-2 py-3 rounded-xl border-2 border-slate-200 text-gray-600 font-semibold text-sm active:scale-95 transition-transform">
                {t.viewList} ({cart.reduce((s, i) => s + i.qty, 0)})
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast />

      {/* 回到顶部 */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-4 right-4 w-10 h-10 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-slate-300 active:scale-90 transition-all z-20"
      >
        <ArrowUp size={16} />
      </button>
    </div>
  );
}

// ==========================================
// 根组件
// ==========================================
export default function Home() {
  return (
    <AuthProvider>
      <MOKApp />
    </AuthProvider>
  );
}
