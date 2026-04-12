# Firebase 项目创建指南

## 第一步：创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com)
2. 点击「添加项目」→「mok-furniture」
3. 关闭 Google Analytics（可选，跳过也行）
4. 点击「创建项目」

## 第二步：注册应用

1. 进入项目后，点击「web」图标 `</>` 注册应用
2. 给应用起个名字，比如 `mok-furniture-web`
3. **不要**勾选「为此应用设置 Firebase Hosting」（我们用 Vercel）
4. 点击「注册应用」

## 第三步：复制配置

页面会显示你的 `firebaseConfig` 对象，长这样：

```json
{
  apiKey: "AIzaSy...",
  authDomain: "mok-furniture.firebaseapp.com",
  projectId: "mok-furniture",
  storageBucket: "mok-furniture.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

**复制这些值，替换 `src/lib/firebase.ts` 里的对应字段。**

## 第四步：启用服务

在 Firebase Console 左侧菜单：

### Authentication
1. 点击「开始使用」
2. 在「匿名」方式上点击「启用」→ 点击「保存」
   （这让客户不用登录就能加购）

### Firestore Database
1. 点击「创建数据库」
2. 选择「以测试模式启动」→ 点击「下一步」
3. 选择服务器位置（建议选：香港或新加坡）→ 点击「完成」
4. **重要：稍后我们需要在这里设置安全规则（第六步）**

### Storage
1. 点击「开始使用」
2. 选择「以测试模式启动」→ 点击「下一步」→ 点击「完成」

## 第五步：在 Firestore 创建初始数据

1. 进入 Firestore → 点击「开始集合」
2. 集合 ID 填：`categories`，直接开始
3. 添加第一条分类：

```
id: "cabinet"
name_th: "ตู้เอกสาร"
sort: 1
```

点击「保存」。

4. 再建一个集合：`products`，添加第一条产品：

```
id: "Y06A"
name_th: "ตู้เอกสารเหล็ก 2 บานเปิด"
name_en: "Steel Cabinet Y06A"
category: "cabinet"
sku: "Y06A"
size: "85x39x180 cm"
price: 2890
original_price: 3290
image: "https://placehold.co/600x400?text=Cabinet+Y06A"
status: true
sort: 1
tags: ["พร้อมส่ง", "เก็บเงินปลายทาง"]
```

## 第六步：设置 Firestore 安全规则

在 Firestore 「规则」标签页，粘贴以下规则：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 产品和分类：所有人可读，只有 admin 可写
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // 购物车：只有本人可读写
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 订单：用户可提交，admin 可读写
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update: if request.auth != null;
    }
  }
}
```

点击「发布」。

## 第七步：设置 Storage 安全规则

在 Storage 「规则」标签页，粘贴：

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

点击「发布」。

## 接下来

1. 把 Firebase 配置填入 `src/lib/firebase.ts`
2. 运行 `npm run dev` 启动开发服务器
3. 访问 `http://localhost:3000` 看效果
4. 访问 `http://localhost:3000/admin` 进入后台
