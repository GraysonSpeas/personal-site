import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthProvider";
import { API_BASE } from '../../config.tsx'; // adjust path as needed

type AuthModalProps = {
  onClose: () => void;
  inline?: boolean;
  centered?: boolean; // new prop
};

type AuthResponse = {
  message: string;
  success?: boolean;
};

interface User {
  email: string;
}

export default function AuthModal({ onClose, inline = false, centered = false }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgotPassword" | "verifyEmail">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { user, refetch, logout } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (!inline) {
      const handleClickOutside = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [inline, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);
    setShowResendVerification(false);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      let endpoint = "";
      const body: any = { email, password };

      if (mode === "login" || mode === "signup") {
        endpoint = mode;
      } else if (mode === "forgotPassword") {
        if (cooldown > 0) {
          setError(`Please wait ${cooldown}s before trying again.`);
          setLoading(false);
          return;
        }
        endpoint = "request-password-reset";
      }

      const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = (await res.json()) as AuthResponse;

      if (!res.ok || data.success === false) {
        if (mode === "login") {
          if (data.message === "Please verify your email before logging in") {
            setError("Verify email to login");
            setShowResendVerification(true);
          } else {
            setError("Wrong credentials");
            setShowResendVerification(false);
          }
        } else {
          setError(data.message || "Something went wrong");
        }
      } else {
        if (mode === "login") {
          setIsLoggedIn(true);
          await refetch();
        } else if (mode === "signup") {
          setMode("verifyEmail");
          setInfoMessage(`Signup successful! Please verify your email: ${email}`);
          setPassword("");
          setConfirmPassword("");
          setCooldown(30);
        } else if (mode === "forgotPassword") {
          setInfoMessage(data.message || "Password reset email sent.");
          setCooldown(30);
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Please enter your email to resend verification.");
      return;
    }

    if (cooldown > 0) {
      setError(`Please wait ${cooldown}s before resending the verification email.`);
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = (await res.json()) as AuthResponse;

      if (!res.ok || data.success === false) {
        setError(data.message || "Failed to resend verification email.");
      } else {
        setInfoMessage(data.message || "Verification email resent.");
        setCooldown(30);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    onClose();
  };

  let formContent;
  const inputClass = "border rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400";

  switch (mode) {
    case "login":
      formContent = (
        <>
          <h2 className="text-2xl mb-2 text-black">Login</h2>
          <p className="text-sm text-gray-600 mb-4">Welcome back! Please sign in.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
            {error && <p className="text-red-600">{error}</p>}
            {infoMessage && <p className="text-green-600">{infoMessage}</p>}
            {showResendVerification && (
              <button onClick={handleResendVerification} disabled={loading || cooldown > 0} type="button" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Resending..." : cooldown > 0 ? `Please wait... (${cooldown}s)` : "Resend Verification Email"}
              </button>
            )}
            <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>
          <button onClick={() => setMode("forgotPassword")} className="mt-2 text-sm text-blue-600 hover:underline" type="button">
            Forgot password?
          </button>
          <p className="mt-4 text-center text-black">
            Don’t have an account?{" "}
            <button onClick={() => setMode("signup")} className="text-blue-600 hover:underline" type="button">
              Sign Up
            </button>
          </p>
        </>
      );
      break;

    case "signup":
      formContent = (
        <>
          <h2 className="text-2xl mb-2 text-black">Sign Up</h2>
          <p className="text-sm text-gray-600 mb-4">Create a new account below.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} />
            {error && <p className="text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          <p className="mt-4 text-center text-black">
            Already have an account?{" "}
            <button onClick={() => setMode("login")} className="text-blue-600 hover:underline" type="button">
              Login
            </button>
          </p>
        </>
      );
      break;

    case "forgotPassword":
      formContent = (
        <>
          <h2 className="text-2xl mb-2 text-black">Reset Password</h2>
          <p className="text-sm text-gray-600 mb-4">Enter your email to receive a reset link.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            {error && <p className="text-red-600">{error}</p>}
            {infoMessage && <p className="text-green-600">{infoMessage}</p>}
            <button type="submit" disabled={loading || cooldown > 0} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {cooldown > 0 ? `Please wait... (${cooldown}s)` : "Send Reset Link"}
            </button>
          </form>
          <button onClick={() => setMode("login")} className="mt-2 text-sm text-blue-600 hover:underline" type="button">
            Back to Login
          </button>
        </>
      );
      break;

    case "verifyEmail":
      formContent = (
        <>
          <h2 className="text-2xl mb-2 text-black">Verify Your Email</h2>
          {infoMessage && <p className="text-green-600 mb-2">{infoMessage}</p>}
          <p className="mb-4 text-black">
            We’ve sent a verification email to <strong>{email}</strong>. Please check your inbox and follow the instructions.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={handleResendVerification} disabled={loading || cooldown > 0} className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Resending..." : cooldown > 0 ? `Please wait... (${cooldown}s)` : "Resend Verification Email"}
            </button>
            <button onClick={() => setMode("login")} className="text-blue-600 hover:underline text-sm" type="button">
              Back to Login
            </button>
          </div>
        </>
      );
      break;
  }

  if (inline) {
    return (
      <div
        className="w-full max-w-md mx-auto rounded p-4 shadow"
        style={{
          background: "linear-gradient(to bottom,rgb(233, 243, 255) 0%, white 50%, white 100%)",
        }}
      >
        {formContent}
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex z-50 ${
        centered ? "items-center justify-center" : "items-start justify-end pt-20 pr-6"
      }`}
    >
      <div
  ref={modalRef}
  className="rounded-lg max-w-md w-full p-6 relative border-0"
style={{
  background: "linear-gradient(to bottom, rgb(233, 243, 255) 0%, white 70%, white 100%)",
  boxShadow: "0 0 15px 6px rgba(59, 130, 246, 0.3)",
  marginRight: centered ? 0 : 12,
  paddingBottom: "2rem",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: 0,
}}
  role="dialog"
  aria-modal="true"
>

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          &times;
        </button>

        {isLoggedIn ? (
          <div className="rounded p-4 shadow-md text-lg mb-4" style={{ backgroundColor: "#ffffff" }}>
            <p className="mb-2">Welcome back, {user?.email}!</p>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 rounded hover:bg-red-700 w-full"
            >
              Logout
            </button>
          </div>
        ) : (
          formContent
        )}
      </div>
    </div>
  );
}