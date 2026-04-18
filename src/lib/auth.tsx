"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // 5秒超时兜底
    timeoutId = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    function handleRejection(event: PromiseRejectionEvent) {
      if (cancelled) return;
      event.preventDefault();
      event.stopPropagation();
      console.warn("[Auth] Unhandled rejection:", event.reason);
      clearTimeout(timeoutId);
      setLoading(false);
    }

    window.addEventListener("unhandledrejection", handleRejection);

    // 延迟初始化 Firebase Auth，避免模块加载时崩溃
    let cleanup: (() => void) | undefined;
    try {
      const auth = getFirebaseAuth();
      cleanup = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (cancelled) return;
          clearTimeout(timeoutId);
          if (firebaseUser) {
            setUser(firebaseUser);
            setLoading(false);
          } else {
            signInAnonymously(auth)
              .then((credential) => { if (!cancelled) setUser(credential.user); })
              .catch((err) => {
                if (!cancelled) {
                  console.warn("[Auth] Anonymous sign-in failed:", err.message);
                  setLoading(false);
                }
              })
              .finally(() => { if (!cancelled) setLoading(false); });
          }
        },
        (error) => {
          if (!cancelled) {
            console.warn("[Auth] onAuthStateChanged error:", error.message);
            setLoading(false);
          }
        }
      );
    } catch (err: any) {
      if (!cancelled) {
        console.warn("[Auth] Init error:", err?.message);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      window.removeEventListener("unhandledrejection", handleRejection);
      cleanup?.();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
