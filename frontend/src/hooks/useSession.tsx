// frontend/src/hooks/useSession.ts
import { useEffect, useState } from "react";

type Session = { email: string } | null;

export function useSession() {
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        setSession(data?.email ? { email: data.email } : null);
        setLoading(false);
      })
      .catch(() => {
        setSession(null);
        setLoading(false);
      });
  }, []);

  return { session, loading };
}