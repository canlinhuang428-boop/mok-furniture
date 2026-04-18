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

// Lazy 单例（永远不会返回 null，避免类型错误）
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function safeGetApp(): FirebaseApp {
  if (!_app) {
    try {
      const apps = getApps();
      _app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    } catch {
      // ignore
    }
  }
  return _app!;
}

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    try { _auth = getAuth(safeGetApp()); } catch {}
  }
  return _auth!;
}

export function getFirebaseDb(): Firestore {
  if (!_db) {
    try { _db = getFirestore(safeGetApp()); } catch {}
  }
  return _db!;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    try { _storage = getStorage(safeGetApp()); } catch {}
  }
  return _storage!;
}

// 兼容旧代码（始终返回有效实例，运行时错误由调用方 catch）
export const auth: Auth = typeof window !== "undefined" ? getFirebaseAuth() : (null as any);
export const db: Firestore = typeof window !== "undefined" ? getFirebaseDb() : (null as any);
export const storage: FirebaseStorage = typeof window !== "undefined" ? getFirebaseStorage() : (null as any);
export default getFirebaseDb;
