import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { resolveProductImage } from "../lib/resolveProductImage";

function loadWishlist() {
  try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); }
  catch { return []; }
}
function saveWishlist(list) { localStorage.setItem("wishlist", JSON.stringify(list)); }

function Tag({ children, variant = "neutral" }) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => loadWishlist());

  useEffect(() => {
    const onStorage = () => setItems(loadWishlist());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const count = useMemo(() => items.length, [items]);

  const removeItem = (id) => {
    const next = items.filter(x => String(x.id) !== String(id));
    saveWishlist(next); setItems(next);
  };

  const clearAll = () => {
    if (!confirm("Clear all wishlist items?")) return;
    saveWishlist([]); setItems([]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Tag variant="accent">wishlist</Tag>
              <Tag variant="neutral">{count} items</Tag>
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic",
              fontSize: "1.75rem", color: "var(--text-primary)", margin: 0
            }}>
              Saved Products
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
              Products you saved to compare or buy later.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn-ghost" onClick={() => navigate(-1)}>← Back</button>
            <button
              className="btn-ghost"
              onClick={clearAll}
              disabled={items.length === 0}
              style={{ color: items.length > 0 ? "var(--rose)" : undefined, borderColor: items.length > 0 ? "rgba(248,113,113,0.3)" : undefined }}
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>♡</div>
          <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: "1rem" }}>
            wishlist is empty
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Open a product and click <em>Wishlist</em> to save it here.
          </div>
          <Link to="/" className="btn-accent">Browse products →</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "0.85rem" }}>
          {items.map(p => (
            <div key={p.id} className="card card-hover" style={{ overflow: "hidden" }}>
              <Link to={`/product/${p.id}`} style={{ display: "block" }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={resolveProductImage(p)} alt={p.name}
                    style={{ width: "100%", height: 160, objectFit: "cover" }}
                    loading="lazy"
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(13,15,20,0.8) 0%, transparent 50%)"
                  }} />
                  <div style={{ position: "absolute", bottom: "0.6rem", left: "0.75rem", right: "0.75rem" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "rgba(255,255,255,0.5)" }}>
                      {p.brand} / {p.category}
                    </div>
                    <div className="line-clamp-1" style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>{p.name}</div>
                  </div>
                </div>
              </Link>
              <div style={{ padding: "0.75rem", display: "flex", gap: "0.5rem" }}>
                <Link
                  to={`/product/${p.id}`}
                  className="btn-ghost"
                  style={{ flex: 1, textAlign: "center", fontSize: "0.75rem" }}
                >
                  View product
                </Link>
                <button
                  className="btn-ghost"
                  onClick={() => removeItem(p.id)}
                  style={{ fontSize: "0.75rem", color: "var(--rose)", borderColor: "rgba(248,113,113,0.2)" }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
