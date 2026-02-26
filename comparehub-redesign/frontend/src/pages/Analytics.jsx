import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { resolveProductImage } from "../lib/resolveProductImage";
import { API_BASE, withFilters } from "../lib/api";

function money(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? `$${x.toFixed(2)}` : "$0.00";
}

function Tag({ children, variant = "neutral" }) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card" style={{ padding: "1.1rem 1.25rem" }}>
      <div className="data-label" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.6rem",
        color: accent ? "var(--accent)" : "var(--text-primary)", lineHeight: 1
      }}>{value}</div>
      {sub && <div className="data-label" style={{ marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [topDeals, setTopDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const [s, d] = await Promise.all([
          fetch(`${API_BASE}${withFilters("/analytics/summary")}`).then(r => r.json()),
          fetch(`${API_BASE}${withFilters("/analytics/top-deals")}`).then(r => r.json()),
        ]);
        if (!ignore) { setSummary(s); setTopDeals(Array.isArray(d) ? d : []); }
      } catch { if (!ignore) { setSummary(null); setTopDeals([]); } }
      finally { if (!ignore) setLoading(false); }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const stats = useMemo(() => {
    const sc = summary?.storeClicks || [];
    const ts = summary?.topSearches || [];
    const totalClicks = sc.reduce((sum, x) => sum + Number(x.clicks || 0), 0);
    const topStore = sc[0];
    const topQuery = ts[0];
    return {
      totalClicks,
      topStore: topStore?.store || "—",
      topStoreClicks: topStore?.clicks || 0,
      topSearch: topQuery?.query || "—",
      topSearchCount: topQuery?.searches || 0,
      dealsCount: topDeals.length,
    };
  }, [summary, topDeals]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Tag variant="accent">analytics</Tag>
              <Tag variant="neutral">7-day window</Tag>
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic",
              fontSize: "1.75rem", color: "var(--text-primary)", margin: 0
            }}>Analytics Dashboard</h1>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
              Click trends, store performance, search patterns, and deal rankings.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link to="/" className="btn-ghost">← Home</Link>
            <Link to="/admin" className="btn-accent">Admin</Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
        </div>
      ) : !summary ? (
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            no data yet — click "Visit →" on product offers to generate analytics
          </div>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
            <StatCard label="total_clicks_7d" value={stats.totalClicks} accent />
            <StatCard label="top_store" value={stats.topStore} sub={`${stats.topStoreClicks} clicks`} />
            <StatCard label="top_search" value={stats.topSearch} sub={`${stats.topSearchCount} searches`} />
            <StatCard label="cheapest_deals" value={stats.dealsCount} sub="tracked products" />
          </div>

          {/* Three columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {/* Trending */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600 }}>TRENDING_PRODUCTS</div>
                <Tag variant="neutral">7d</Tag>
              </div>
              <div style={{ padding: "0.75rem" }}>
                {summary.trendingProducts?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {summary.trendingProducts.map((p, i) => (
                      <Link key={p.id} to={`/product/${p.id}`}
                        style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem", borderRadius: 4, border: "1px solid var(--border)", background: "var(--bg-raised)", transition: "all 150ms" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-hi)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                      >
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", width: 16 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <img src={resolveProductImage(p)} alt={p.name} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 3, border: "1px solid var(--border)" }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="line-clamp-1" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)" }}>{p.clicks} clicks</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.78rem", padding: "0.5rem 0" }}>
                    no clicks yet
                  </div>
                )}
              </div>
            </div>

            {/* Store performance */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600 }}>STORE_PERFORMANCE</div>
                <Tag variant="neutral">7d</Tag>
              </div>
              <div style={{ padding: "0.75rem" }}>
                {summary.storeClicks?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {summary.storeClicks.map((s, idx) => {
                      const max = Number(summary.storeClicks[0]?.clicks || 1);
                      const pct = Math.round((Number(s.clicks || 0) / max) * 100);
                      return (
                        <div key={idx} style={{ padding: "0.5rem 0.6rem", border: "1px solid var(--border)", borderRadius: 4, background: "var(--bg-raised)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{s.store}</span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--accent)" }}>{s.clicks}</span>
                          </div>
                          <div style={{ height: 4, background: "var(--bg-hover)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: 2, transition: "width 500ms ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.78rem", padding: "0.5rem 0" }}>no store clicks yet</div>
                )}
              </div>
            </div>

            {/* Top searches */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "0.85rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600 }}>TOP_SEARCHES</div>
                <Tag variant="neutral">7d</Tag>
              </div>
              <div style={{ padding: "0.75rem" }}>
                {summary.topSearches?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    {summary.topSearches.map((q, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.45rem 0.6rem", border: "1px solid var(--border)", borderRadius: 4, background: "var(--bg-raised)" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>"{q.query}"</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>{q.searches}×</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.78rem", padding: "0.5rem 0" }}>no searches tracked</div>
                )}
              </div>
            </div>
          </div>

          {/* Top deals table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                CHEAPEST_DEALS_INDEX
              </div>
              <Tag variant="accent">top 20</Tag>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ minWidth: 700, width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg-raised)" }}>
                    {["#", "Product", "Best Price", "Store", "Rating", ""].map((h, i) => (
                      <th key={i} style={{ padding: "0.6rem 1rem", textAlign: i > 1 ? "left" : i === 0 ? "center" : "left", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600, letterSpacing: "0.05em", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topDeals.map((p, ri) => {
                    const displayPrice = Number(p.bestPrice) > 0 ? p.bestPrice : (p.originalPrice ?? 0);
                    return (
                      <tr key={p.id} style={{ background: ri % 2 === 0 ? "var(--bg-card)" : "var(--bg-raised)" }}>
                        <td style={{ padding: "0.6rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "center", borderBottom: "1px solid var(--border)" }}>
                          {String(ri + 1).padStart(2, "0")}
                        </td>
                        <td style={{ padding: "0.6rem 1rem", borderBottom: "1px solid var(--border)" }}>
                          <Link to={`/product/${p.id}`} style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                            <img src={resolveProductImage(p)} alt={p.name} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 3, border: "1px solid var(--border)", flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.82rem" }}>{p.name}</div>
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-muted)" }}>{p.brand} / {p.category}</div>
                            </div>
                          </Link>
                        </td>
                        <td style={{ padding: "0.6rem 1rem", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.9rem", color: "var(--accent)", borderBottom: "1px solid var(--border)" }}>
                          {money(displayPrice)}
                        </td>
                        <td style={{ padding: "0.6rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
                          {p.bestSource || "—"}
                        </td>
                        <td style={{ padding: "0.6rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--amber)", borderBottom: "1px solid var(--border)" }}>
                          {p.bestRating != null ? `★ ${Number(p.bestRating).toFixed(1)}` : "—"}
                        </td>
                        <td style={{ padding: "0.6rem 1rem", textAlign: "right", borderBottom: "1px solid var(--border)" }}>
                          <Link to={`/product/${p.id}`} className="btn-ghost" style={{ fontSize: "0.72rem", padding: "0.3rem 0.65rem" }}>
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {topDeals.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: "2rem", textAlign: "center", fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        no deals yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
