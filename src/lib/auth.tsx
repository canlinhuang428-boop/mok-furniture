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
  const [loading, setLoading] = useState(true); // 先等 auth 稳定，超时兜底

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    // 超时兜底：5秒后强制结束 loading
    timeoutId = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        if (firebaseUser) {
          setUser(firebaseUser);
          setLoading(false);
        } else {
          signInAnonymously(auth)
            .then((credential) => { if (!cancelled) setUser(credential.user); })
            .catch(() => { if (!cancelled) setLoading(false); })
            .finally(() => { if (!cancelled) setLoading(false); });
        }
      });
      return () => { cancelled = true; clearTimeout(timeoutId); unsubscribe(); };
    } catch {
      if (!cancelled) { clearTimeout(timeoutId); setLoading(false); }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
