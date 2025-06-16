// src/auth/AuthProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_BASE } from "../../config";

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

// Fetch current user from the API
const fetchUser = async () => {
  console.log("📡 [Auth] fetchUser start; API_BASE =", API_BASE);
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    });
    console.log("↩️ [Auth] /auth/me status:", res.status);

    if (res.ok) {
      const { user: fetchedUserRaw } = await res.json();
      const { email } = fetchedUserRaw || {};

      if (email) {
        const sanitizedUser: User = { email };
        setUser(sanitizedUser);
        console.log("✅ [Auth] User fetched:", sanitizedUser);
      } else {
        console.warn("⚠️ [Auth] Invalid user object:", fetchedUserRaw);
        setUser(null);
      }
    } else {
      console.warn("⚠️ [Auth] Not authenticated (status:", res.status, ")");
      setUser(null);
    }
  } catch (err) {
    console.error("💥 [Auth] Error fetching user:", err);
    setUser(null);
  } finally {
    console.log("⏹️ [Auth] fetchUser complete; setting loading=false");
    setLoading(false);
  }
};


  // Log out the current user
  const logout = async () => {
    console.log("🔒 [Auth] Logging out");
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      console.log("↩️ [Auth] /auth/logout status:", res.status);
    } catch (err) {
      console.error("💥 [Auth] Logout failed:", err);
    } finally {
      setUser(null);
      // Note: we leave `loading` untouched here, since we’re already authenticated flow
    }
  };

  // On mount, check session
  useEffect(() => {
    console.log("🔌 [Auth] AuthProvider mounted; calling fetchUser()");
    void fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, refetch: fetchUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}