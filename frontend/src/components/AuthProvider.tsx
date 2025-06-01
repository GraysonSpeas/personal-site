import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { API_BASE } from "../config";

type User = {
  email: string;
  name?: string;
  created_at?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refetch: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    console.log("🔄 fetchUser called");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/account`, {
        credentials: "include",
      });
      console.log("🔍 /auth/account status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("✅ User fetched:", data.user);
        setUser(data.user);
      } else {
        console.warn("⚠️ Not authenticated");
        setUser(null);
      }
    } catch (err) {
      console.error("❌ Error fetching user:", err);
      setUser(null);
    } finally {
      setLoading(false);
      console.log("🟢 fetchUser loading false");
    }
  };

  const logout = async () => {
    console.log("🚪 logout called");
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      console.log("👋 Logged out");
    } catch (err) {
      console.error("❌ Logout failed:", err);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refetch: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}