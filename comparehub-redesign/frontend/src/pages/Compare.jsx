import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resolveProductImage } from "../lib/resolveProductImage";
import { normalizeCategory } from "../lib/normalizeCategory";
import { API_BASE, withFilters } from "../lib/api";

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x) || x <= 0) return "—";
  return `$${x.toFixed(2)}`;
}

function Tag({ children, variant = "neutral" }) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}

function loadCompareSelected() {
  try {
    const v = JSON.parse(localStorage.getItem("compare_selected") || "[]");
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

function saveCompareSelected(ids) {
  localStorage.setItem("compare_selected", JSON.stringify(ids));
}

function parseIdsParam(sp) {
  const raw = sp.get("ids") || "";
  return Array.from(new Set(
    raw.split(",").map(x => Number(String(x).trim())).filter(x => Number.isFinite(x) && x > 0)
  ));
}

function bestOfferFromOffers(offers = []) {
  const valid = (Array.isArray(offers) ? offers : [])
    .filter(o => Number.isFinite(Number(o?.price)) && Number(o.price) > 0)
    .map(o => ({ source: o.source || "", price: Number(o.price), rating: o.rating != null ? Number(o.rating) : null, url: o.url || null }));
  if (!valid.length) return null;
  valid.sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return (b.rating ?? -1) - (a.rating ?? -1);
  });
  return valid[0];
}

function hasNonEmptySpecs(specs) {
  return specs && typeof specs === "object" && Object.keys(specs).length > 0;
}

export default function Compare() {
  const [sp, setSp] = useSearchParams();

  const selectedIds = useMemo(() => {
    const fromUrl = parseIdsParam(sp);
    if (fromUrl.length) return fromUrl;
    return loadCompareSelected();
  }, [sp]);

  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => { saveCompareSelected(selectedIds); }, [selectedIds]);

  const removeId = (id) => {
    const next = selectedIds.filter(x => x !== id);
    saveCompareSelected(next);
    if ((sp.get("ids") || "").length > 0) {
      if (next.length) setSp({ ids: next.join(",") });
      else setSp({});
    }
  };

  useEffect(() => {
    let alive = true;
    async function fetchJson(url) {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }

    async function run() {
      setLoading(true); setError(""); setProducts([]); setFilters(null);
      if (selectedIds.length < 2) { setLoading(false); return; }

      try {
        const compareUrl = `${API_BASE}${withFilters(`/compare?ids=${selectedIds.join(",")}`)}`;
        const compareData = await fetchJson(compareUrl);
        const rawProducts = Array.isArray(compareData?.products) ? compareData.products : [];

        const needsDetail = rawProducts.filter(p => {
          const cb = Number(p?.bestOffer?.price);
          const hasCB = Number.isFinite(cb) && cb > 0;
          const co = Array.isArray(p?.offers) ? p.offers : [];
          const hasCO = co.some(o => Number.isFinite(Number(o?.price)) && Number(o.price) > 0);
          return !(hasCB || hasCO) || !hasNonEmptySpecs(p?.specs);
        });

        const detailById = new Map();
        await Promise.all(needsDetail.map(async p => {
          if (!p?.id) return;
          try {
            const d = await fetchJson(`${API_BASE}${withFilters(`/products/${p.id}`)}`);
            detailById.set(p.id, d);
          } catch {}
        }));

        const enriched = rawProducts.map(p => {
          const co = Array.isArray(p?.offers) ? p.offers : [];
          const cb = Number(p?.bestOffer?.price);
          const hasCB = Number.isFinite(cb) && cb > 0;
          const hasCO = co.some(o => Number.isFinite(Number(o?.price)) && Number(o.price) > 0);
          const detail = detailById.get(p.id);

          let finalOffers = co, finalBestOffer = null;
          if (hasCB) finalBestOffer = { source: p.bestOffer?.source || "", price: cb, rating: p.bestOffer?.rating ?? null, url: p.bestOffer?.url ?? null };
          else if (hasCO) finalBestOffer = bestOfferFromOffers(co);
          else { const dOffers = Array.isArray(detail?.offers) ? detail.offers : []; finalOffers = dOffers; finalBestOffer = bestOfferFromOffers(dOffers); }

          const finalSpecs = hasNonEmptySpecs(p?.specs) ? p.specs : hasNonEmptySpecs(detail?.specs) ? detail.specs : null;
          return { ...p, offers: finalOffers, bestOffer: finalBestOffer || { source: "", price: null, rating: null, url: null }, specs: finalSpecs, _displayPrice: finalBestOffer?.price ?? null, _priceLabel: finalBestOffer ? "best offer" : "original price" };
        });

        if (!alive) return;
        setFilters(compareData?.filters || null);
        setProducts(enriched);
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setError(String(e?.message || e));
        setLoading(false);
      }
    }

    run();
    return () => { alive = false; };
  }, [selectedIds]);

  const comparisonRows = useMemo(() => {
    const rows = [];
    const base = [
      ["Brand", p => p.brand],
      ["Category", p => normalizeCategory(p.category)],
      ["Price", p => money(p._displayPrice)],
      ["Store", p => p?.bestOffer?.source || "—"],
      ["Rating", p => p?.bestOffer?.rating != null ? Number(p.bestOffer.rating).toFixed(1) : "—"],
    ];
    for (const [label, fn] of base) rows.push({ label, values: products.map(p => fn(p) ?? "—") });

    const specKeys = [
      ["CPU", p => p?.specs?.cpu],
      ["GPU", p => p?.specs?.gpu],
      ["RAM (GB)", p => p?.specs?.ram],
      ["Storage (GB)", p => p?.specs?.storage],
      ["Screen (in)", p => p?.specs?.screen_size ?? p?.specs?.display_size],
      ["Resolution", p => p?.specs?.resolution],
      ["Battery (hrs)", p => p?.specs?.battery_hours],
      ["Weight (lb)", p => p?.specs?.weight],
      ["OS", p => p?.specs?.os],
      ["ANC", p => p?.specs?.anc === true ? "Yes" : p?.specs?.anc === false ? "No" : null],
      ["Type", p => p?.specs?.type],
      ["Codec", p => p?.specs?.codec_support],
      ["Multipoint", p => p?.specs?.multipoint === true ? "Yes" : p?.specs?.multipoint === false ? "No" : null],
    ];
    for (const [label, fn] of specKeys) {
      const vals = products.map(p => fn(p));
      if (vals.some(v => v !== null && v !== undefined && String(v).trim() !== "")) {
        rows.push({ label, values: vals.map(v => v ?? "—") });
      }
    }
    return rows;
  }, [products]);

  // Find best price for highlighting
  const lowestPrice = useMemo(() => {
    const prices = products.map(p => p._displayPrice).filter(x => x != null && x > 0);
    return prices.length ? Math.min(...prices) : null;
  }, [products]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Tag variant="accent">compare</Tag>
              {filters?.condition && <Tag variant="neutral">{filters.condition}</Tag>}
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic",
              fontSize: "1.75rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.2
            }}>
              Product Comparison
            </h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
              Select at least 2 products from Home to begin.
            </p>
            <Link to="/" style={{ fontSize: "0.8rem", color: "var(--accent)", marginTop: "0.5rem", display: "inline-block" }}>
              ← Back to products
            </Link>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div className="data-label">selected</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "2rem", fontWeight: 600, color: "var(--accent)", lineHeight: 1 }}>
              {selectedIds.length}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: "1rem", borderColor: "var(--rose-dim)", background: "var(--rose-dim)" }}>
          <div style={{ fontFamily: "var(--font-mono)", color: "var(--rose)", fontSize: "0.8rem" }}>ERROR: {error}</div>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            loading comparison...
          </div>
        </div>
      ) : selectedIds.length < 2 ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
            no items selected
          </div>
          <Link to="/" className="btn-accent">Browse products →</Link>
        </div>
      ) : (
        <>
          {/* Product cards */}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(products.length, 4)}, 1fr)`, gap: "0.85rem" }}>
            {products.map(p => (
              <div key={p.id} className="card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "0.85rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                      {p.brand} / {normalizeCategory(p.category)}
                    </div>
                    <div className="line-clamp-2" style={{ fontWeight: 600, fontSize: "0.9rem", marginTop: 3 }}>{p.name}</div>
                  </div>
                  <button
                    onClick={() => removeId(p.id)}
                    className="btn-ghost"
                    style={{ padding: "0.25rem 0.5rem", marginLeft: "0.5rem", flexShrink: 0 }}
                  >✕</button>
                </div>

                <img
                  src={resolveProductImage(p)} alt={p.name}
                  style={{ width: "100%", height: 160, objectFit: "cover", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
                />

                <div style={{ padding: "0.85rem" }}>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                    {p?.bestOffer?.source ? (
                      <>
                        <Tag variant="blue">{p.bestOffer.source}</Tag>
                        {p.bestOffer.rating != null && <Tag variant="amber">★ {Number(p.bestOffer.rating).toFixed(1)}</Tag>}
                      </>
                    ) : <Tag variant="neutral">no offers</Tag>}
                  </div>

                  <div style={{
                    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.4rem",
                    color: p._displayPrice === lowestPrice ? "var(--accent)" : "var(--text-primary)"
                  }}>
                    {money(p._displayPrice)}
                    {p._displayPrice === lowestPrice && products.filter(x => x._displayPrice != null).length > 1 && (
                      <Tag variant="accent" style={{ marginLeft: "0.4rem", verticalAlign: "middle", fontSize: "0.6rem" }}>BEST</Tag>
                    )}
                  </div>
                  <div className="data-label" style={{ marginTop: 2 }}>{p._priceLabel}</div>

                  <div style={{ marginTop: "0.85rem", display: "flex", gap: "0.5rem" }}>
                    <Link to={`/product/${p.id}`} className="btn-ghost" style={{ flex: 1, textAlign: "center" }}>
                      Details
                    </Link>
                    {p?.bestOffer?.url ? (
                      <a href={p.bestOffer.url} target="_blank" rel="noreferrer" className="btn-accent">
                        Buy →
                      </a>
                    ) : (
                      <button className="btn-accent" disabled>No link</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                SPEC_COMPARISON_TABLE
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ minWidth: 600, width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-raised)" }}>
                    <th style={{ padding: "0.7rem 1rem", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em", borderBottom: "1px solid var(--border)", width: 160 }}>
                      FIELD
                    </th>
                    {products.map(p => (
                      <th key={p.id} style={{ padding: "0.7rem 1rem", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-primary)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>
                        <div className="line-clamp-1">{p.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, ri) => (
                    <tr key={row.label} style={{ background: ri % 2 === 0 ? "var(--bg-card)" : "var(--bg-raised)" }}>
                      <td style={{ padding: "0.6rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                        {row.label}
                      </td>
                      {row.values.map((v, idx) => (
                        <td key={idx} style={{ padding: "0.6rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: v === "—" ? "var(--text-muted)" : "var(--text-primary)", borderBottom: "1px solid var(--border)" }}>
                          {String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
