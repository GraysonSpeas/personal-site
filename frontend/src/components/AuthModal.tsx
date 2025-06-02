import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { API_BASE } from "../config";

type AuthModalProps = {
  onClose: () => void;
  inline?: boolean;
};

type AuthResponse = {
  message: string;
};

export default function AuthModal({ onClose, inline = false }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, refetch, logout } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inline) {
      function handleClickOutside(e: MouseEvent) {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [inline, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/auth/${isLogin ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        setError(data.message || "Something went wrong");
      } else {
        await refetch();
        onClose();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div
          ref={modalRef}
          className="bg-white rounded-lg max-w-md w-full p-6 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
          >
            &times;
          </button>
          <p className="text-lg mb-4">Logged in as @{user.email}</p>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const FormContent = (
    <>
      <h2 className="text-2xl mb-4 text-black">{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      <p className="mt-4 text-center text-black">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:underline"
          type="button"
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </>
  );

  if (inline) {
    return <div className="bg-white p-6 rounded shadow" ref={modalRef}>{FormContent}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative" ref={modalRef}>
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
        {FormContent}
      </div>
    </div>
  );
}