import { useState } from "react";

type AuthModalProps = {
  onClose: () => void;
  inline?: boolean;
};

type AuthResponse = {
  message: string;
};

const AuthModal = ({ onClose, inline = false }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 👇 Local worker endpoint
  const API_BASE = "http://127.0.0.1:8787/auth";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/${isLogin ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // 🔥 Needed for cookies
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        console.error("❌ Auth error:", data);
        setError(data.message || "Something went wrong");
      } else {
        console.log("✅ Auth success:", data);
        window.location.href = "/account"; // ✅ Redirect on success
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
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
    return <div className="bg-white p-6 rounded shadow">{FormContent}</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
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
};

export default AuthModal;