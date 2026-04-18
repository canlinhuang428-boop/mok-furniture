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

// 模块级单例（延迟初始化）
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function getApp(): FirebaseApp {
  if (!_app) {
    const apps = getApps();
    _app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(getApp());
  return _auth;
}

export function getFirebaseDb(): Firestore {
  if (!_db) _db = getFirestore(getApp());
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) _storage = getStorage(getApp());
  return _storage;
}

// 兼容旧代码（lazy getter，在 client 环境调用）
export const auth: Auth = (typeof window !== "undefined" ? getFirebaseAuth() : null) as Auth;
export const db: Firestore = (typeof window !== "undefined" ? getFirebaseDb() : null) as Firestore;
export const storage: FirebaseStorage = (typeof window !== "undefined" ? getFirebaseStorage() : null) as FirebaseStorage;
export default getApp;
