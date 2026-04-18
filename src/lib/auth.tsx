"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

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
    let timeoutId: ReturnType<typeof setTimeout>;

    // 5秒超时兜底
    timeoutId = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    // 捕获 Firebase SDK 抛出的未处理 Promise 拒绝
    function handleRejection(event: PromiseRejectionEvent) {
      if (cancelled) return;
      event.preventDefault();
      event.stopPropagation();
      console.warn("[Auth] Unhandled promise rejection:", event.reason);
      setLoading(false);
    }

    window.addEventListener("unhandledrejection", handleRejection);

    try {
      const unsubscribe = onAuthStateChanged(
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

      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
        window.removeEventListener("unhandledrejection", handleRejection);
        unsubscribe();
      };
    } catch (err: any) {
      if (!cancelled) {
        console.warn("[Auth] Init error:", err?.message);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
