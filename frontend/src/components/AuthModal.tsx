import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { API_BASE } from "../config";

type AuthModalProps = {
  onClose: () => void;
  inline?: boolean;
};

type AuthResponse = {
  message: string;
  success?: boolean;
};

export default function AuthModal({ onClose, inline = false }: AuthModalProps) {
  // Modes: login, signup, forgotPassword, verifyEmail
  const [mode, setMode] = useState<"login" | "signup" | "forgotPassword" | "verifyEmail">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
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
    setInfoMessage(null);
    setShowResendVerification(false); // reset resend button visibility on submit

    try {
      let endpoint = "";
      let bodyData: any = { email };

      if (mode === "login") {
        endpoint = "login";
        bodyData.password = password;
      } else if (mode === "signup") {
        endpoint = "signup";
        bodyData.password = password;
      } else if (mode === "forgotPassword") {
        endpoint = "forgot-password";
      }

      const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
        credentials: "include",
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || data.success === false) {
        setError(data.message || "Something went wrong");

        // Show resend verification if login error says to verify email
        if (
          mode === "login" &&
          data.message === "Please verify your email before logging in"
        ) {
          setShowResendVerification(true);
        }
      } else {
        if (mode === "login") {
          await refetch();
          onClose();
        } else if (mode === "signup") {
          setMode("verifyEmail");
          setInfoMessage(`Signup successful! Please verify your email: ${email}`);
          setPassword("");
        } else if (mode === "forgotPassword") {
          setInfoMessage(data.message || "Password reset email sent! Check your inbox.");
        }
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!email) {
      setError("Please enter your email to resend verification.");
      return;
    }
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const response = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      const data = (await response.json()) as AuthResponse;
      if (!response.ok || data.success === false) {
        setError(data.message || "Failed to resend verification email.");
      } else {
        setInfoMessage(data.message || "Verification email resent. Check your inbox.");
        setShowResendVerification(false); // optionally hide resend button after success
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
            aria-label="Close modal"
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

  // Forms for login/signup/forgot-password/verify-email
  let formContent;
  switch (mode) {
    case "login":
      formContent = (
        <>
          <h2 className="text-2xl mb-4 text-black">Login</h2>
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
            {showResendVerification && (
              <>
                {infoMessage && <p className="text-green-600">{infoMessage}</p>}
                <button
                  onClick={handleResendVerification}
                  disabled={loading}
                  type="button"
                  className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {loading ? "Resending..." : "Resend Verification Email"}
                </button>
              </>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>
          <button
            onClick={() => {
              setError(null);
              setInfoMessage(null);
              setShowResendVerification(false);
              setMode("forgotPassword");
            }}
            className="mt-2 text-sm text-blue-600 hover:underline"
            type="button"
          >
            Forgot password?
          </button>
          <p className="mt-4 text-center text-black">
            Don't have an account?{" "}
            <button
              onClick={() => {
                setError(null);
                setInfoMessage(null);
                setShowResendVerification(false);
                setMode("signup");
              }}
              className="text-blue-600 hover:underline"
              type="button"
            >
              Sign Up
            </button>
          </p>
        </>
      );
      break;

    case "signup":
      formContent = (
        <>
          <h2 className="text-2xl mb-4 text-black">Sign Up</h2>
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
              {loading ? "Please wait..." : "Sign Up"}
            </button>
          </form>
          <p className="mt-4 text-center text-black">
            Already have an account?{" "}
            <button
              onClick={() => {
                setError(null);
                setInfoMessage(null);
                setShowResendVerification(false);
                setMode("login");
              }}
              className="text-blue-600 hover:underline"
              type="button"
            >
              Login
            </button>
          </p>
        </>
      );
      break;

    case "forgotPassword":
      formContent = (
        <>
          <h2 className="text-2xl mb-4 text-black">Forgot Password</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {error && <p className="text-red-600">{error}</p>}
            {infoMessage && <p className="text-green-600">{infoMessage}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          <button
            onClick={() => {
              setError(null);
              setInfoMessage(null);
              setShowResendVerification(false);
              setMode("login");
            }}
            className="mt-2 text-sm text-blue-600 hover:underline"
            type="button"
          >
            Back to Login
          </button>
        </>
      );
      break;

    case "verifyEmail":
      formContent = (
        <>
          <h2 className="text-2xl mb-4 text-black">Verify Your Email</h2>
          {infoMessage && <p className="mb-4 text-green-600">{infoMessage}</p>}
          <p className="mb-4 text-black">
            Please check your email ({email}) and click the verification link to
            complete your signup.
          </p>
          <button
            onClick={() => setMode("login")}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            type="button"
          >
            Back to Login
          </button>
        </>
      );
      break;

    default:
      formContent = null;
  }

  if (inline) {
    return <div className="w-full max-w-md mx-auto">{formContent}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-md w-full p-6 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          &times;
        </button>
        {formContent}
      </div>
    </div>
  );
}