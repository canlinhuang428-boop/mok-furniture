import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBWAyEcDfXNHcN9sGCKVqve31cVfJy6QUc",
  authDomain: "th-mok.firebaseapp.com",
  projectId: "th-mok",
  storageBucket: "th-mok.firebasestorage.app",
  messagingSenderId: "728006418720",
  appId: "1:728006418720:web:e57eef237a3d8e66397745",
};

// 初始化 Firebase（防止热更新重复初始化）
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export default app;
