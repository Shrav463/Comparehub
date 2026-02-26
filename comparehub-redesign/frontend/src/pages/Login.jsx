import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, setToken } from "../lib/auth";
import { API_BASE } from "../lib/api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@comparehub.com");
  const [password, setPassword] = useState("Admin@123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isLoggedIn()) nav("/admin"); }, [nav]);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data?.error || "Login failed"); return; }
      setToken(data.token);
      nav("/admin");
    } catch {
      setErr("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", paddingTop: "2rem" }}>
      <div className="card" style={{ padding: "2rem" }}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span className="tag tag-accent">admin</span>
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400,
            fontSize: "1.6rem", color: "var(--text-primary)", margin: 0
          }}>Sign In</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
            Access the admin panel to manage products and offers.
          </p>
        </div>

        {err && (
          <div style={{
            padding: "0.7rem 0.85rem", borderRadius: "var(--radius)", marginBottom: "1rem",
            background: "var(--rose-dim)", border: "1px solid rgba(248,113,113,0.2)",
            fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--rose)"
          }}>
            ERROR: {err}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <div className="data-label" style={{ marginBottom: 4 }}>email</div>
            <input
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@comparehub.com"
              type="email"
            />
          </div>
          <div>
            <div className="data-label" style={{ marginBottom: 4 }}>password</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div style={{ marginTop: "0.25rem", padding: "0.7rem", background: "var(--bg-raised)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
            <div className="data-label" style={{ marginBottom: "0.3rem" }}>default credentials</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
              admin@comparehub.com / Admin@123
            </div>
          </div>

          <button className="btn-accent" type="submit" disabled={loading} style={{ marginTop: "0.25rem", width: "100%", padding: "0.7rem" }}>
            {loading ? "signing in..." : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  );
}
