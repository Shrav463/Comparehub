import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resolveProductImage } from "../lib/resolveProductImage";
import { normalizeCategory } from "../lib/normalizeCategory";
import { API_BASE, withFilters } from "../lib/api";

function money(n) {
  const x = Number(n ?? 0);
  if (Number.isNaN(x)) return "$0.00";
  return `$${x.toFixed(2)}`;
}

function Tag({ children, variant = "neutral" }) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}

function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: "0.9rem" }}>
        <div className="skeleton" style={{ height: 10, width: "60%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "85%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 18, width: "40%", marginTop: 16 }} />
      </div>
    </div>
  );
}

function loadCompareSelected() {
  try {
    const v = JSON.parse(localStorage.getItem("compare_selected") || "[]");
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

export default function Home() {
  const [sp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState("low");
  const [q, setQ] = useState(() => sp.get("q") || "");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const next = sp.get("q") || "";
    setQ(prev => prev === next ? prev : next);
  }, [sp]);

  const [selected, setSelected] = useState(() => loadCompareSelected());
  useEffect(() => {
    localStorage.setItem("compare_selected", JSON.stringify(selected));
  }, [selected]);

  const toggleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };
  const compareLink = selected.length >= 2 ? `/compare?ids=${selected.join(",")}` : null;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("sort", sort);
    params.set("q", q || "");
    params.set("category", category);
    params.set("brand", brand);
    if (minPrice !== "") params.set("minPrice", minPrice);
    if (maxPrice !== "") params.set("maxPrice", maxPrice);
    if (minRating !== "") params.set("minRating", minRating);

    fetch(`${API_BASE}${withFilters(`/products?${params.toString()}`)}`)
      .then(r => r.json())
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sort, q, category, brand, minPrice, maxPrice, minRating]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => normalizeCategory(p.category)).filter(Boolean));
    const list = Array.from(set);
    const preferred = ["Phones", "Laptops", "Headphones"];
    list.sort((a, b) => {
      const ai = preferred.indexOf(a), bi = preferred.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return a.localeCompare(b);
    });
    return ["all", ...list];
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set(products.map(p => p.brand).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const topPicks = useMemo(() => products.slice(0, 5), [products]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ─── HERO ─── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto", gap: "1.5rem",
        alignItems: "start"
      }}>
        {/* Left: search + filters */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Tag variant="accent">CompareHub</Tag>
            <Tag variant="neutral">v1.0</Tag>
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 400,
            color: "var(--text-primary)",
            margin: "0.5rem 0 0.4rem",
            lineHeight: 1.2,
            fontStyle: "italic"
          }}>
            Find the best deal,<br/> <span style={{ color: "var(--accent)", fontStyle: "normal", fontFamily: "var(--font-sans)", fontWeight: 700 }}>across every store.</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            Search, filter, compare specs side-by-side, and click through to buy — no clutter.
          </p>

          {/* Search */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <input
              className="input"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setQ(q)}
              placeholder="headphones, MacBook M3, Samsung S24…"
              style={{ flex: 1 }}
            />
            <button className="btn-accent" onClick={() => setQ(v => v)}>Search</button>
          </div>

          {/* Quick tags */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {["phones", "laptops", "headphones", "smartwatch"].map(term => (
              <button
                key={term}
                onClick={() => setQ(term)}
                style={{
                  fontFamily: "var(--font-mono)", fontSize: "0.7rem",
                  padding: "0.2rem 0.6rem", cursor: "pointer",
                  background: "var(--bg-raised)", border: "1px solid var(--border)",
                  borderRadius: "3px", color: "var(--text-muted)",
                  transition: "color 150ms, border-color 150ms"
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent-border)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                #{term}
              </button>
            ))}
          </div>
        </div>

        {/* Right: top picks */}
        <div className="card" style={{ width: 320, padding: "1rem", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              TOP_PICKS
            </span>
            <Tag variant="accent">LIVE</Tag>
          </div>

          {topPicks.length === 0 ? (
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Loading products…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {topPicks.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="card-hover"
                  style={{
                    display: "flex", alignItems: "center", gap: "0.7rem",
                    padding: "0.6rem", borderRadius: "4px", border: "1px solid var(--border)",
                    background: "var(--bg-raised)", transition: "all 180ms"
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", width: 14 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <img
                    src={resolveProductImage(p)} alt={p.name}
                    style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 3, flexShrink: 0, border: "1px solid var(--border)" }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="line-clamp-1" style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.bestSource || "—"}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: 600, color: "var(--accent)", flexShrink: 0 }}>
                    {money(p.bestPrice)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
        {[
          { step: "01", label: "Search", desc: "Query by name, brand, or category" },
          { step: "02", label: "Filter", desc: "Narrow by price range, rating, brand" },
          { step: "03", label: "Compare", desc: "Select 2–4 products for side-by-side" },
          { step: "04", label: "Buy", desc: "Click through to best-deal store" },
        ].map(item => (
          <div key={item.step} className="card" style={{ padding: "1rem" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--accent)", fontWeight: 600, marginBottom: "0.3rem" }}>
              STEP_{item.step}
            </div>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{item.label}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* ─── FILTERS ─── */}
      <div className="card" style={{ padding: "1rem 1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.75rem", alignItems: "end" }}>
          <div>
            <div className="data-label" style={{ marginBottom: 4 }}>Category</div>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
            </select>
          </div>
          <div>
            <div className="data-label" style={{ marginBottom: 4 }}>Brand</div>
            <select className="input" value={brand} onChange={e => setBrand(e.target.value)}>
              {brands.map(b => <option key={b} value={b}>{b === "all" ? "All brands" : b}</option>)}
            </select>
          </div>
          <div>
            <div className="data-label" style={{ marginBottom: 4 }}>Min Price ($)</div>
            <input className="input" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" inputMode="decimal" />
          </div>
          <div>
            <div className="data-label" style={{ marginBottom: 4 }}>Max Price ($)</div>
            <input className="input" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="9999" inputMode="decimal" />
          </div>
          <div>
            <div className="data-label" style={{ marginBottom: 4 }}>Min Rating</div>
            <select className="input" value={minRating} onChange={e => setMinRating(e.target.value)}>
              <option value="">Any</option>
              <option value="3.5">3.5+</option>
              <option value="4.0">4.0+</option>
              <option value="4.5">4.5+</option>
              <option value="4.7">4.7+</option>
            </select>
          </div>
          <div>
            <div className="data-label" style={{ marginBottom: 4 }}>Sort by</div>
            <select className="input" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="low">Price ↑</option>
              <option value="high">Price ↓</option>
              <option value="rating">Rating ↓</option>
            </select>
          </div>
          {/* Compare control */}
          <div style={{ gridColumn: "span 2" }}>
            <div className="data-label" style={{ marginBottom: 4 }}>Compare basket ({selected.length}/4)</div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div className="input" style={{ flex: 1, cursor: "default" }}>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  {selected.length === 0 ? "No products selected" : `${selected.length} product${selected.length > 1 ? "s" : ""} selected`}
                </span>
              </div>
              <button className="btn-ghost" onClick={() => setSelected([])} title="Clear">✕</button>
              {compareLink ? (
                <Link to={compareLink} className="btn-accent" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  Compare →
                </Link>
              ) : (
                <button className="btn-accent" disabled>Compare →</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── RESULTS HEADER ─── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {loading ? "loading..." : (
            <span>
              <span style={{ color: "var(--accent)" }}>{products.length}</span> results
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Click <span style={{ color: "var(--text-secondary)" }}>Compare</span> on a card to add it to basket
        </div>
      </div>

      {/* ─── PRODUCT GRID ─── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.85rem" }}>
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.85rem" }}>
            {products.map(p => {
              const isSelected = selected.includes(p.id);
              const cat = normalizeCategory(p.category);
              return (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    overflow: "hidden",
                    transition: "border-color 180ms, transform 180ms",
                    borderColor: isSelected ? "var(--accent)" : undefined,
                  }}
                  onMouseEnter={e => !isSelected && (e.currentTarget.style.borderColor = "var(--border-hi)")}
                  onMouseLeave={e => !isSelected && (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <Link to={`/product/${p.id}`} style={{ display: "block" }}>
                    <div style={{ position: "relative", background: "var(--bg-raised)" }}>
                      <img
                        src={resolveProductImage(p)} alt={p.name}
                        style={{ height: 176, width: "100%", objectFit: "cover", display: "block" }}
                        loading="lazy"
                      />
                      {/* Overlay badges */}
                      <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                        {p.bestSource ? <Tag variant="blue">{p.bestSource}</Tag> : <Tag variant="neutral">no offers</Tag>}
                        {p.bestRating != null ? (
                          <Tag variant="amber">★ {Number(p.bestRating).toFixed(1)}</Tag>
                        ) : null}
                      </div>
                      {isSelected && (
                        <div style={{
                          position: "absolute", top: 8, right: 8,
                          background: "var(--accent)", color: "#050a07",
                          fontSize: "0.65rem", fontFamily: "var(--font-mono)", fontWeight: 700,
                          padding: "0.2rem 0.45rem", borderRadius: 3
                        }}>
                          SELECTED
                        </div>
                      )}
                    </div>

                    <div style={{ padding: "0.85rem 0.85rem 0.6rem" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", marginBottom: 4 }}>
                        {p.brand} / {cat}
                      </div>
                      <div className="line-clamp-2" style={{ fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.35, fontSize: "0.9rem" }}>
                        {p.name}
                      </div>
                      <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.15rem", color: "var(--accent)" }}>
                            {money(p.bestPrice)}
                          </div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                            best price
                          </div>
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "var(--blue)" }}>view →</span>
                      </div>
                    </div>
                  </Link>

                  <div style={{ padding: "0 0.85rem 0.85rem", display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => toggleSelect(p.id)}
                      className={isSelected ? "btn-accent" : "btn-ghost"}
                      style={{ flex: 1 }}
                    >
                      {isSelected ? "✓ Selected" : "+ Compare"}
                    </button>
                    <Link
                      to={`/product/${p.id}`}
                      className="btn-ghost"
                      style={{ display: "inline-flex", alignItems: "center" }}
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                no results found — try different filters
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
