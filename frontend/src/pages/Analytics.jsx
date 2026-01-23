import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { resolveProductImage } from "../lib/resolveProductImage";
import { API_BASE, withFilters } from "../lib/api";

function money(n) {
  const x = Number(n ?? 0);
  return Number.isFinite(x) ? `$${x.toFixed(2)}` : "$0.00";
}

function StatCard({ title, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-600">{title}</div>
      <div className="text-2xl font-extrabold text-slate-900 mt-1">{value}</div>
      {sub ? <div className="text-xs text-slate-500 mt-1">{sub}</div> : null}
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
          fetch(`${API_BASE}${withFilters(`/analytics/summary`)}`).then((r) => r.json()),
          fetch(`${API_BASE}${withFilters(`/analytics/top-deals`)}`).then((r) => r.json()),
        ]);

        if (!ignore) {
          setSummary(s);
          setTopDeals(Array.isArray(d) ? d : []);
        }
      } catch (e) {
        console.error(e);
        if (!ignore) {
          setSummary(null);
          setTopDeals([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const stats = useMemo(() => {
    const tp = summary?.trendingProducts || [];
    const sc = summary?.storeClicks || [];
    const ts = summary?.topSearches || [];

    const totalClicks = sc.reduce((sum, x) => sum + Number(x.clicks || 0), 0);
    const topStore = sc.length ? sc[0] : null;
    const topQuery = ts.length ? ts[0] : null;

    return {
      totalClicks,
      topStore: topStore ? `${topStore.store}` : "—",
      topStoreClicks: topStore ? topStore.clicks : 0,
      topSearch: topQuery ? `${topQuery.query}` : "—",
      topSearchCount: topQuery ? topQuery.searches : 0,
      dealsCount: topDeals.length,
    };
  }, [summary, topDeals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              Analytics Dashboard
            </div>
            <div className="text-slate-600 mt-1">
              Real data: trending clicks, store performance, searches, and cheapest deals.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
            >
              ← Home
            </Link>
            <Link
              to="/admin"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Loading dashboard…
        </div>
      ) : !summary ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="font-bold text-slate-900">No data yet</div>
          <div className="text-slate-600 mt-1">
            Click “Visit website” on a product to generate analytics.
          </div>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Total outbound clicks (7 days)"
              value={stats.totalClicks}
              sub="Clicks on “Visit website / Buy at best price”"
            />
            <StatCard
              title="Top store"
              value={stats.topStore}
              sub={`${stats.topStoreClicks} clicks`}
            />
            <StatCard
              title="Top search"
              value={stats.topSearch}
              sub={`${stats.topSearchCount} searches`}
            />
            <StatCard
              title="Cheapest deals"
              value={stats.dealsCount}
              sub="Products with offers sorted by best price"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Trending Products */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900">Trending Products</div>
                  <div className="text-sm text-slate-600">Most clicked this week</div>
                </div>
                <span className="text-xs font-semibold text-slate-500">7d</span>
              </div>

              <div className="mt-4 space-y-3">
                {summary.trendingProducts?.length ? (
                  summary.trendingProducts.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition"
                    >
                      <img
                        src={resolveProductImage(p)}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                        <div className="text-xs text-slate-600">{p.clicks} clicks</div>
                      </div>
                      <div className="text-xs font-semibold text-indigo-700">View →</div>
                    </Link>
                  ))
                ) : (
                  <div className="text-sm text-slate-600">
                    No clicks yet. Open a product and click “Visit website”.
                  </div>
                )}
              </div>
            </div>

            {/* Store Clicks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900">Store Performance</div>
                  <div className="text-sm text-slate-600">Clicks by store</div>
                </div>
                <span className="text-xs font-semibold text-slate-500">7d</span>
              </div>

              <div className="mt-4 space-y-3">
                {summary.storeClicks?.length ? (
                  summary.storeClicks.map((s, idx) => {
                    const max = Number(summary.storeClicks[0]?.clicks || 1);
                    const pct = Math.round((Number(s.clicks || 0) / max) * 100);
                    return (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-slate-900">{s.store}</div>
                          <div className="text-sm text-slate-700">{s.clicks}</div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-slate-600">No store clicks yet.</div>
                )}
              </div>
            </div>

            {/* Top Searches */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900">Top Searches</div>
                  <div className="text-sm text-slate-600">Most searched queries</div>
                </div>
                <span className="text-xs font-semibold text-slate-500">7d</span>
              </div>

              <div className="mt-4 space-y-2">
                {summary.topSearches?.length ? (
                  summary.topSearches.map((q, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <div className="text-slate-900 font-semibold">{q.query}</div>
                      <div className="text-slate-700 text-sm">{q.searches}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-600">
                    No searches tracked yet. Try searching on Home.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Deals Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-extrabold text-slate-900">Cheapest Deals</div>
                <div className="text-sm text-slate-600">Lowest bestPrice across products</div>
              </div>
              <span className="text-xs font-semibold text-slate-500">Top 20</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left text-xs font-extrabold text-slate-600 px-5 py-3 border-b border-slate-200">
                      Product
                    </th>
                    <th className="text-left text-xs font-extrabold text-slate-600 px-5 py-3 border-b border-slate-200">
                      Best Price
                    </th>
                    <th className="text-left text-xs font-extrabold text-slate-600 px-5 py-3 border-b border-slate-200">
                      Store
                    </th>
                    <th className="text-left text-xs font-extrabold text-slate-600 px-5 py-3 border-b border-slate-200">
                      Rating
                    </th>
                    <th className="text-right text-xs font-extrabold text-slate-600 px-5 py-3 border-b border-slate-200">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {topDeals.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="px-5 py-4">
                        <Link to={`/product/${p.id}`} className="flex items-center gap-3">
                          <img
                            src={resolveProductImage(p)}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-600">{p.brand} • {p.category}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-extrabold text-slate-900">
                        {p.bestPrice != null ? money(p.bestPrice) : "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {p.bestSource || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {p.bestRating != null ? `⭐ ${Number(p.bestRating).toFixed(1)}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/product/${p.id}`}
                          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {topDeals.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-5 py-6 text-slate-600">
                        No deals yet. Add offers in Admin or run Sync.
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