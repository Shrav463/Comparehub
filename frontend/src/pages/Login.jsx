import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, setToken } from "../lib/auth";
import { API_BASE } from "../lib/api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@comparehub.com");
  const [password, setPassword] = useState("Admin@123");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (isLoggedIn()) nav("/admin");
  }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Login failed");
        return;
      }

      setToken(data.token);
      nav("/admin");
    } catch (e2) {
      setErr("Network error. Is the backend running?");
    }
  };

  return (
    <div className="max-w-md mx-auto rounded-2xl border border-white/10 bg-white/5 p-6">
      <h1 className="text-2xl font-extrabold">Admin Login</h1>
      <p className="text-white/60 mt-1">Login to manage products and offers.</p>

      {err && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200 text-sm">
          {err}
        </div>
      )}

      <form onSubmit={submit} className="mt-5 space-y-3">
        <input
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        <button className="w-full rounded-xl bg-indigo-500 px-4 py-3 font-semibold hover:bg-indigo-400 transition">
          Sign in →
        </button>
      </form>
    </div>
  );
}
