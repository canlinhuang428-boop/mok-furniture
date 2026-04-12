# MOK Homeware 网站操作手册

## 📌 概述

网站地址（本地）：http://localhost:3000
Firebase 项目：th-mok
技术栈：Next.js + Firebase Firestore + Firebase Auth

---

## 🛒 客户操作流程

### 1. 浏览产品
- 首页展示精选产品（featured = true）
- 点击顶部分类标签筛选
- 搜索栏按名称或 SKU 搜索

### 2. 产品详情
- 点击产品卡片 → 弹出详情
- 支持多图轮播滑动查看
- 显示 SKU、尺寸、库存状态

### 3. 加入购物车
- 点击 "+ เพิ่มลงรายการ" 加入
- 自动写入 Firebase Firestore（云端购物车）
- 换设备也能看到

### 4. 提交询价
- 点击顶部购物车按钮进入购物车页
- 填写姓名、电话（选填）
- 点击"ส่งให้แอดมินเช็คสต็อก"提交到 Firestore
- 或点击"ส่งให้ LINE"直接跳转 LINE 发送给客服

---

## ⚙️ 后台管理操作

### 进入后台
1. 首页滚动到底部
2. 点击 "Admin Setup"
3. 输入密码：`admin123`
4. 解锁后台功能

### 后台功能
- **新增产品**：填写泰文名、SKU、尺寸、分类，保存
- **删除产品**：点击 🗑️
- **调整排序**：点击 ⬆️ ⬇️（调整在 Firestore 里的顺序）
- **导出 JSON**：下载产品数据备份

### 后台密码修改
文件位置：`~/mok-furniture/src/app/page.tsx`
搜索 `admin123`，改成你自己的密码

---

## 📦 Firebase 数据结构

### products（产品表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 产品ID（SKU） |
| category_id | string | 分类ID |
| name_th | string | 泰文名称 |
| name_en | string | 英文名称 |
| name_zh | string | 中文名称 |
| sku | string | SKU编码 |
| size | string | 尺寸如 "85x39x180 cm" |
| images | array | 图片URL数组 |
| tags_th/en/zh | array | 产品标签 |
| featured | bool | 是否显示在精选区 |
| stock_status | string | "in_stock" / "out_of_stock" |

### categories（分类表）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 分类ID |
| name_th | string | 泰文名称 |
| name_en | string | 英文名称 |
| name_zh | string | 中文名称 |
| sort | number | 排序顺序 |

### orders（询价单表）
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | string | Firebase用户ID |
| name | string | 客户姓名 |
| phone | string | 客户电话 |
| note | string | 客户备注 |
| items | array | 加购的产品列表 |
| status | string | pending / contacted / completed |
| created_at | string | 提交时间 |

---

## 🔧 常见问题

### Q: 产品显示不出来？
**A:** Firebase Firestore 安全规则未发布。需要去 Firebase Console 发布规则：
https://console.firebase.google.com/project/th-mok/firestore/rules

### Q: 如何上传产品图片？
**A:** 有两种方式：
1. 上传到 Firebase Storage（需要先开通）
2. 上传到免费图床（如 catbox.moe），把 URL 填入 Firestore

### Q: 如何修改 LINE 联系方式？
**A:** 编辑 `~/mok-furniture/src/app/page.tsx`，搜索 `639isuyr` 改成你的 LINE ID

### Q: 如何添加新产品？
**A:** 进入后台 → 填写产品信息 → 保存，数据自动写入 Firestore

### Q: 如何查看客户询价单？
**A:** 进入 `/admin/orders`（目前需通过后台展开器访问）

---

## 🚀 部署到 Vercel

### 准备工作
1. 注册 Vercel 账号：https://vercel.com
2. 安装 Vercel CLI：`npm i -g vercel`

### 部署步骤
```bash
cd ~/mok-furniture
vercel login
vercel --prod
```

或通过 GitHub 连接仓库实现自动部署。

### 部署后配置
1. 在 Vercel 项目设置中添加环境变量（NEXT_PUBLIC_FIREBASE_*）
2. 在 Firebase Console 添加 Vercel 域名到授权域名列表

---

## 📁 项目文件结构

```
~/mok-furniture/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主页面（含所有视图）
│   │   ├── layout.tsx        # 根布局
│   │   └── globals.css       # 全局样式
│   ├── components/            # 组件
│   └── lib/
│       ├── firebase.ts        # Firebase 配置
│       ├── auth.tsx          # 匿名登录
│       └── types.ts          # 数据类型定义
├── public/                    # 静态资源
├── firebase-admin.json        # 服务账号（不要分享！）
├── firestore.rules           # Firestore 安全规则
├── vercel.json              # Vercel 配置
└── MANUAL.md                # 本手册
```

---

## ⚠️ 安全注意

- `firebase-admin.json` 是服务账号密钥，**不要提交到 GitHub**
- 后台密码 `admin123` 建议改成更复杂的
- Firestore 安全规则控制数据读写权限

---

## 📞 技术支持

如有问题，请联系开发者。
