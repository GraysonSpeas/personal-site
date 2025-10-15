// src/auth/AuthProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_BASE } from "../../config";

export type User = {
  email: string;
  name?: string;
  created_at?: string;
};

type AuthContextType = {
  user: User | null | undefined;
  loading: boolean;
  refetch: (opts?: { silent?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  loading: true,
  refetch: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null | undefined>(
    initialUser ?? undefined
  );
  const [loading, setLoading] = useState(user === undefined);

  // Fetch user client-side only if no initialUser
  const fetchUser = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (res.ok) {
        const { user: fetchedUserRaw } = await res.json();
        const email = fetchedUserRaw?.email;
        setUser(email ? { email } : null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    setUser(null);
  };

  // Only fetch user if not provided
  useEffect(() => {
    if (user === undefined) void fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refetch: fetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}