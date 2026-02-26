import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { clearToken, isLoggedIn } from "../lib/auth";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-1.5 rounded text-xs font-semibold transition-all ${
          isActive
            ? "text-[var(--accent)] bg-[var(--accent-dim)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout({ children }) {
  const nav = useNavigate();
  const location = useLocation();
  const logged = isLoggedIn();
  const currentQ = new URLSearchParams(location.search).get("q") || "";

  const logout = () => {
    clearToken();
    nav("/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "rgba(13,15,20,0.92)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto",
          padding: "0 1.25rem",
          height: 52,
          display: "flex", alignItems: "center", gap: "1.25rem"
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="1.5" fill="var(--accent)" opacity=".9"/>
              <rect x="13" y="2" width="9" height="9" rx="1.5" fill="var(--accent)" opacity=".4"/>
              <rect x="2" y="13" width="9" height="9" rx="1.5" fill="var(--accent)" opacity=".4"/>
              <rect x="13" y="13" width="9" height="9" rx="1.5" fill="var(--accent)" opacity=".9"/>
            </svg>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1 }}>
                CompareHub
              </div>
              <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
                PRICE COMPARISON
              </div>
            </div>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 500, display: "flex" }}>
            <div style={{
              display: "flex", alignItems: "center",
              background: "var(--bg-raised)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", overflow: "hidden", width: "100%",
            }}>
              <span style={{
                padding: "0 0.6rem", color: "var(--text-muted)",
                fontFamily: "var(--font-mono)", fontSize: "0.7rem",
                borderRight: "1px solid var(--border)", whiteSpace: "nowrap",
                alignSelf: "stretch", display: "flex", alignItems: "center",
              }}>~/search</span>
              <input
                className="input"
                style={{ border: "none", borderRadius: 0, background: "transparent", flex: 1 }}
                placeholder="product, brand, category..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") nav(`/?q=${encodeURIComponent(e.target.value)}`);
                }}
                defaultValue={currentQ}
              />
              <button
                className="btn-accent"
                style={{ borderRadius: 0, margin: 0 }}
                onClick={(e) => {
                  const input = e.currentTarget.closest("div")?.querySelector("input");
                  nav(`/?q=${encodeURIComponent(input?.value ?? "")}`);
                }}
              >
                →
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginLeft: "auto" }}>
            <NavItem to="/">Home</NavItem>
            <NavItem to="/wishlist">Wishlist</NavItem>
            <NavItem to="/compare">Compare</NavItem>
            <NavItem to="/analytics">Analytics</NavItem>
            {logged ? (
              <>
                <NavItem to="/admin">Admin</NavItem>
                <button className="btn-ghost" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }} onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="btn-ghost" style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }} onClick={() => nav("/login")}>
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1280, margin: "0 auto", width: "100%", padding: "1.75rem 1.25rem" }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-raised)",
        padding: "2rem 1.25rem",
        marginTop: "auto"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "1.5rem" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
              CompareHub
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Go + PostgreSQL + React + Tailwind
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              © {new Date().getFullYear()} — Compare prices, buy smarter.
            </div>
          </div>
          <div style={{ display: "flex", gap: "3rem" }}>
            <div>
              <div className="data-label" style={{ marginBottom: "0.5rem" }}>Pages</div>
              {["/", "/wishlist", "/compare", "/analytics"].map((href, i) => (
                <div key={href} style={{ marginBottom: "0.25rem" }}>
                  <Link to={href} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}
                    onMouseEnter={e => e.target.style.color = "var(--accent)"}
                    onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}
                  >
                    {["Home", "Wishlist", "Compare", "Analytics"][i]}
                  </Link>
                </div>
              ))}
            </div>
            <div>
              <div className="data-label" style={{ marginBottom: "0.5rem" }}>Stores</div>
              {[["Amazon", "https://amazon.com"], ["Best Buy", "https://bestbuy.com"], ["Walmart", "https://walmart.com"]].map(([label, href]) => (
                <div key={href} style={{ marginBottom: "0.25rem" }}>
                  <a href={href} target="_blank" rel="noreferrer" style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}
                    onMouseEnter={e => e.target.style.color = "var(--accent)"}
                    onMouseLeave={e => e.target.style.color = "var(--text-secondary)"}
                  >
                    {label}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
