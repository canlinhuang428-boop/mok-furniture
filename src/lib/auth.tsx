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
  const [loading, setLoading] = useState(false); // 默认false，让产品先显示

  useEffect(() => {
    let cancelled = false;
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (cancelled) return;
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
      return () => { cancelled = true; unsubscribe(); };
    } catch {
      if (!cancelled) setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
