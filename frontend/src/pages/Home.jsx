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

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-indigo-50 text-indigo-700 border-indigo-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}
    >
      {children}
    </span>
  );
}

function IconBtn({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition inline-flex items-center justify-center"
      type="button"
    >
      {children}
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="h-44 bg-slate-100 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-slate-100 animate-pulse rounded" />
        <div className="h-4 w-1/3 bg-slate-100 animate-pulse rounded mt-3" />
      </div>
    </div>
  );
}

function loadCompareSelected() {
  try {
    const v = JSON.parse(localStorage.getItem("compare_selected") || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [sp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState("low"); // low | high | rating
  const [q, setQ] = useState(() => sp.get("q") || "");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [loading, setLoading] = useState(true);

  // Sync search term if user navigates using the top search bar (/?q=...)
  useEffect(() => {
    const next = sp.get("q") || "";
    setQ((prev) => (prev === next ? prev : next));
  }, [sp]);

  // Compare selection (2–4) — persisted
  const [selected, setSelected] = useState(() => loadCompareSelected());
  useEffect(() => {
    localStorage.setItem("compare_selected", JSON.stringify(selected));
  }, [selected]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev; // max 4
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
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sort, q, category, brand, minPrice, maxPrice, minRating]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => normalizeCategory(p.category)).filter(Boolean));
    const list = Array.from(set);
    // put core categories first
    const preferred = ["Phones", "Laptops", "Headphones"];
    list.sort((a, b) => {
      const ai = preferred.indexOf(a);
      const bi = preferred.indexOf(b);
      if (ai !== -1 || bi !== -1) {
        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      }
      return a.localeCompare(b);
    });
    return ["all", ...list];
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const topPicks = useMemo(() => products.slice(0, 6), [products]);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2">
                <Badge tone="blue">CompareHub</Badge>
                <Badge tone="slate">Price comparison</Badge>
              </div>

              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Compare prices across top stores
              </h1>
              <p className="mt-2 text-slate-600">
                Search products, filter by category, and compare specs side-by-side before buying.
              </p>

              {/* Big search bar */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search products (ex: headphones, laptop, iphone)…"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={() => setQ((v) => v)}
                  className="rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                  type="button"
                >
                  Search
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["phones", "laptops", "headphones"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQ(term)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    type="button"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Top picks */}
            <div className="w-full lg:w-[380px] rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-slate-900">Top picks</div>
                <Badge tone="green">Live</Badge>
              </div>
              <div className="mt-3 space-y-3">
                {topPicks.length === 0 ? (
                  <div className="text-sm text-slate-600">No products yet. Seed data or sync a feed.</div>
                ) : (
                  topPicks.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition"
                    >
                      <img
                        src={resolveProductImage(p)}
                        alt={p.name}
                        className="h-14 w-14 rounded-xl object-cover border border-slate-200"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-600 truncate">
                          {p.bestSource ? `${p.bestSource} • ⭐ ${(Number(p.bestRating || 0)).toFixed(1)}` : "No offers"}
                        </div>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900">{money(p.bestPrice)}</div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
{/* HOW IT WORKS */}
<div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-extrabold text-slate-900">
      How CompareHub works
    </h2>
    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      Recruiter-friendly
    </span>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Card 1 */}
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="font-bold text-slate-900 mb-1">
        1) Browse & Filter
      </div>
      <p className="text-sm text-slate-600 mb-3">
        Search products, filter by category or brand, and quickly narrow down
        items that match your needs.
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge>Search</Badge>
        <Badge>Filters</Badge>
        <Badge>Sort</Badge>
      </div>
    </div>

    {/* Card 2 */}
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="font-bold text-slate-900 mb-1">
        2) Compare (2–4)
      </div>
      <p className="text-sm text-slate-600 mb-3">
        Select up to four products and compare price, store, rating, and key
        specs side-by-side.
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge tone="green">Compare</Badge>
        <Badge tone="blue">Specs</Badge>
        <Badge tone="amber">Best deal</Badge>
      </div>
    </div>

    {/* Card 3 */}
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="font-bold text-slate-900 mb-1">
        3) Best Offer Highlight
      </div>
      <p className="text-sm text-slate-600 mb-3">
        For each product, the best available offer is highlighted so users can
        instantly see the lowest price and top store.
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge tone="blue">Lowest price</Badge>
        <Badge tone="green">Top rating</Badge>
      </div>
    </div>

    {/* Card 4 */}
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="font-bold text-slate-900 mb-1">
        4) Simple Buying Flow
      </div>
      <p className="text-sm text-slate-600 mb-3">
        Review details, explore offers, and jump directly to the store with the
        best deal — fast and distraction-free.
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge tone="rose">Clean UI</Badge>
        <Badge>Fast</Badge>
        <Badge>Easy</Badge>
      </div>
    </div>
  </div>
</div>

        {/* FILTER ROW */}
        <div className="border-t border-slate-200 bg-white p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All categories" : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b === "all" ? "All brands" : b}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Price range (best offer)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Min rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any rating</option>
                <option value="3.5">3.5+</option>
                <option value="4.0">4.0+</option>
                <option value="4.5">4.5+</option>
                <option value="4.7">4.7+</option>
              </select>
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Sort</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Best price: Low → High</option>
                <option value="high">Best price: High → Low</option>
                <option value="rating">Rating: High → Low</option>
              </select>
            </div>

            <div className="md:col-span-8">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Compare (2–4)</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Selected: <span className="font-extrabold text-slate-900">{selected.length}</span>
                </div>

                <IconBtn title="Clear selection" onClick={() => setSelected([])}>
                  ✕
                </IconBtn>

                {compareLink ? (
                  <Link
                    to={compareLink}
                    className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                  >
                    Compare →
                  </Link>
                ) : (
                  <button
                    className="rounded-2xl bg-indigo-200 px-4 py-3 text-sm font-semibold text-white cursor-not-allowed"
                    disabled
                    type="button"
                  >
                    Compare →
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Tip: click <span className="font-semibold">Compare</span> on product cards to select items.
          </div>
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-600">
          {loading ? (
            "Loading products…"
          ) : (
            <>
              Showing <span className="font-extrabold text-slate-900">{products.length}</span> products
            </>
          )}
        </div>
      </div>

      {/* PRODUCT GRID */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => {
              const isSelected = selected.includes(p.id);
              const cat = normalizeCategory(p.category);

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <Link to={`/product/${p.id}`} className="block">
                    <div className="relative">
                      <img
                        src={resolveProductImage(p)}
                        alt={p.name}
                        className="h-48 w-full object-cover"
                        loading="lazy"
                      />

                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {p.bestSource ? <Badge tone="blue">{p.bestSource}</Badge> : <Badge tone="slate">No offers</Badge>}
                        {p.bestRating != null ? <Badge tone="green">⭐ {Number(p.bestRating || 0).toFixed(1)}</Badge> : null}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="text-xs text-slate-500 truncate">
                        {p.brand} • {cat}
                      </div>
                      <div className="mt-1 font-extrabold text-slate-900 leading-tight line-clamp-2">{p.name}</div>

                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <div className="text-lg font-extrabold text-slate-900">{money(p.bestPrice)}</div>
                          <div className="text-xs text-slate-500">Best price</div>
                        </div>

                        <div className="text-sm font-semibold text-indigo-700">View offers →</div>
                      </div>
                    </div>
                  </Link>

                  {/* Card actions */}
                  <div className="px-4 pb-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSelect(p.id)}
                      className={`flex-1 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition
                        ${isSelected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50"}`}
                      title="Select for comparison"
                    >
                      {isSelected ? "Selected" : "Compare"}
                    </button>

                    <Link
                      to={`/product/${p.id}`}
                      className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
              No products found. Try a different search term or clear filters.
            </div>
          )}
        </>
      )}
    </div>
  );
}
