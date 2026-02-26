import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resolveProductImage } from "../lib/resolveProductImage";
import { normalizeCategory } from "../lib/normalizeCategory";
import { API_BASE, withFilters } from "../lib/api";

function loadWishlist() {
  try { return JSON.parse(localStorage.getItem("wishlist") || "[]"); }
  catch { return []; }
}
function saveWishlist(list) { localStorage.setItem("wishlist", JSON.stringify(list)); }
function formatVal(v) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

function getSpecRows(category) {
  if (category === "Phones") return [["Chipset","chipset"],["RAM (GB)","ram"],["Storage (GB)","storage"],["Display (in)","display_size"],["Refresh Hz","refresh_rate"],["Camera (MP)","camera_main_mp"],["Battery (mAh)","battery_mah"],["Charging (W)","charging_watts"],["5G","5g"],["OS","os_version"]];
  if (category === "Laptops") return [["CPU","cpu"],["GPU","gpu"],["RAM (GB)","ram"],["Storage (GB)","storage"],["Screen (in)","screen_size"],["Resolution","resolution"],["Battery (hrs)","battery_hours"],["Weight (lb)","weight"],["Ports","ports"],["OS","os"]];
  if (category === "Headphones") return [["Type","type"],["ANC","anc"],["Battery (hrs)","battery_hours"],["Multipoint","multipoint"],["Codec","codec_support"]];
  return [["CPU/Chipset","chipset","cpu"],["RAM","ram"],["Storage","storage"]];
}

function Tag({ children, variant = "neutral" }) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}

export default function Product() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [offerSort, setOfferSort] = useState("low");
  const [loading, setLoading] = useState(true);
  const normalizedCategory = useMemo(() => normalizeCategory(p?.category), [p?.category]);
  const [wishlist, setWishlist] = useState(() => loadWishlist());
  const isWishlisted = useMemo(() => wishlist.some(x => String(x.id) === String(id)), [wishlist, id]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}${withFilters(`/products/${id}`)}`)
      .then(r => r.json()).then(setP).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const offers = useMemo(() => {
    const list = [...(p?.offers || [])];
    if (offerSort === "low") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (offerSort === "high") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (offerSort === "rating") list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    return list;
  }, [p, offerSort]);

  const bestOffer = offers.length ? offers[0] : null;

  const toggleWishlist = () => {
    const current = loadWishlist();
    if (current.some(x => String(x.id) === String(id))) {
      const next = current.filter(x => String(x.id) !== String(id));
      saveWishlist(next); setWishlist(next); return;
    }
    const item = { id: p?.id, name: p?.name, imageUrl: p?.imageUrl, brand: p?.brand, category: p?.category };
    const next = [item, ...current].slice(0, 50);
    saveWishlist(next); setWishlist(next);
  };

  const trackAndOpen = async (url, storeName) => {
    try {
      await fetch(`${API_BASE}/track/click`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: Number(p?.id), storeName, url }) });
    } catch {}
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {[240, 120, 180].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 6 }} />)}
    </div>
  );

  if (!p) return (
    <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>product not found</div>
      <Link to="/" className="btn-accent" style={{ display: "inline-block", marginTop: "1rem" }}>← Back</Link>
    </div>
  );

  const specRows = getSpecRows(normalizedCategory);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Breadcrumb */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)", display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <Link to="/" style={{ color: "var(--accent)" }}>Home</Link>
        <span>/</span>
        <span>{normalizedCategory || p.category}</span>
        <span>/</span>
        <span className="line-clamp-1" style={{ color: "var(--text-primary)" }}>{p.name}</span>
      </div>

      {/* Main section */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Image */}
        <div className="card" style={{ width: 320, overflow: "hidden", flexShrink: 0 }}>
          <img
            src={resolveProductImage(p)} alt={p.name}
            style={{ width: "100%", height: 280, objectFit: "cover" }}
          />
          <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.5rem" }}>
            <Tag variant="blue">{normalizedCategory || p.category}</Tag>
            {p.brand && <Tag variant="neutral">{p.brand}</Tag>}
          </div>
        </div>

        {/* Info */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.4rem", color: "var(--text-primary)", margin: "0 0 0.5rem", lineHeight: 1.25 }}>
            {p.name}
          </h1>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            {p.description || "No description provided."}
          </p>

          {/* Price block */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <div className="card" style={{ padding: "0.85rem", borderColor: bestOffer ? "var(--accent-border)" : undefined, background: bestOffer ? "var(--accent-dim)" : undefined }}>
              <div className="data-label">best price</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem", color: "var(--accent)", marginTop: 2 }}>
                {bestOffer ? `$${Number(bestOffer.price).toFixed(2)}` : "—"}
              </div>
              {bestOffer && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: 2 }}>
                  {bestOffer.source} {bestOffer.rating != null ? `• ★ ${Number(bestOffer.rating).toFixed(1)}` : ""}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: "0.85rem" }}>
              <div className="data-label">offers available</div>
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem", color: "var(--blue)", marginTop: 2 }}>
                {offers.length}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: 2 }}>
                stores tracked
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
            {bestOffer?.url ? (
              <button className="btn-accent" onClick={() => trackAndOpen(bestOffer.url, bestOffer.source)} style={{ flex: 1 }}>
                Buy at best price →
              </button>
            ) : (
              <button className="btn-accent" disabled style={{ flex: 1 }}>No offers available</button>
            )}
            <button
              className={isWishlisted ? "btn-accent" : "btn-ghost"}
              onClick={toggleWishlist}
              style={{ whiteSpace: "nowrap" }}
            >
              {isWishlisted ? "♥ Saved" : "♡ Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Specs + Highlights */}
      {p.specs && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem", alignItems: "start" }}>
          {/* Specs table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                TECHNICAL_SPECS
              </div>
              {p.lastUpdated && <div className="data-label">{p.lastUpdated}</div>}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {specRows.map((row, ri) => {
                  const label = row[0];
                  const keys = row.slice(1);
                  let val = "—";
                  for (const k of keys) {
                    if (p.specs && Object.prototype.hasOwnProperty.call(p.specs, k)) {
                      val = formatVal(p.specs[k]); break;
                    }
                  }
                  return (
                    <tr key={label} style={{ background: ri % 2 === 0 ? "var(--bg-card)" : "var(--bg-raised)" }}>
                      <td style={{ padding: "0.6rem 1.25rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)", width: 160, whiteSpace: "nowrap", borderBottom: "1px solid var(--border)" }}>
                        {label}
                      </td>
                      <td style={{ padding: "0.6rem 1.25rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: val === "—" ? "var(--text-muted)" : "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>
                        {val}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Highlights */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.85rem" }}>
              HIGHLIGHTS
            </div>

            {Array.isArray(p.specs?.key_features) && p.specs.key_features.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div className="data-label" style={{ marginBottom: "0.5rem" }}>Key Features</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {p.specs.key_features.map((x, i) => <Tag key={i} variant="blue">{x}</Tag>)}
                </div>
              </div>
            )}

            {Array.isArray(p.specs?.pros) && p.specs.pros.length > 0 && (
              <div style={{ marginBottom: "0.75rem" }}>
                <div className="data-label" style={{ marginBottom: "0.5rem" }}>Pros</div>
                {p.specs.pros.map((x, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.4rem", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                    <span style={{ color: "var(--accent)", fontSize: "0.7rem", marginTop: "0.2rem" }}>▲</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{x}</span>
                  </div>
                ))}
              </div>
            )}

            {Array.isArray(p.specs?.cons) && p.specs.cons.length > 0 && (
              <div>
                <div className="data-label" style={{ marginBottom: "0.5rem" }}>Cons</div>
                {p.specs.cons.map((x, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.4rem", alignItems: "flex-start", marginBottom: "0.3rem" }}>
                    <span style={{ color: "var(--rose)", fontSize: "0.7rem", marginTop: "0.2rem" }}>▼</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{x}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offers */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              STORE_OFFERS ({offers.length})
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="data-label">sort</span>
            <select className="input" value={offerSort} onChange={e => setOfferSort(e.target.value)} style={{ width: "auto" }}>
              <option value="low">Price ↑</option>
              <option value="high">Price ↓</option>
              <option value="rating">Rating ↓</option>
            </select>
          </div>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", padding: "0.5rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-raised)" }}>
          {["Store", "Price", "Rating", ""].map((h, i) => (
            <div key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: i === 3 ? "right" : "left" }}>{h}</div>
          ))}
        </div>

        {offers.map((o, idx) => (
          <div
            key={idx}
            style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
              padding: "0.8rem 1.25rem",
              borderBottom: idx < offers.length - 1 ? "1px solid var(--border)" : "none",
              background: idx === 0 ? "var(--accent-dim)" : idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-raised)",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 4, background: "var(--bg-hover)",
                border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", flexShrink: 0
              }}>
                {o.source?.slice(0, 2).toUpperCase() || "ST"}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{o.source}</div>
                {idx === 0 && <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent)" }}>BEST DEAL</div>}
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.95rem", color: idx === 0 ? "var(--accent)" : "var(--text-primary)" }}>
              ${Number(o.price).toFixed(2)}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {o.rating != null ? `★ ${Number(o.rating).toFixed(1)}` : "—"}
            </div>
            <div style={{ textAlign: "right" }}>
              <button onClick={() => trackAndOpen(o.url, o.source)} className="btn-ghost" style={{ fontSize: "0.75rem", padding: "0.35rem 0.7rem" }}>
                Visit →
              </button>
            </div>
          </div>
        ))}

        {offers.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
            no offers available
          </div>
        )}
      </div>
    </div>
  );
}
