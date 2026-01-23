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
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        tones[tone] || tones.slate
      }`}
    >
      {children}
    </span>
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

function saveCompareSelected(ids) {
  localStorage.setItem("compare_selected", JSON.stringify(ids));
}

function parseIdsParam(sp) {
  const raw = sp.get("ids") || "";
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((x) => Number(String(x).trim()))
        .filter((x) => Number.isFinite(x) && x > 0)
    )
  );
}

function bestOfferFromOffers(offers = []) {
  const valid = (Array.isArray(offers) ? offers : [])
    .filter((o) => Number.isFinite(Number(o?.price)) && Number(o.price) > 0)
    .map((o) => ({
      source: o.source || "",
      price: Number(o.price),
      rating: o.rating != null ? Number(o.rating) : null,
      url: o.url || null,
    }));

  if (!valid.length) return null;

  // Lowest price wins; tie-breaker: higher rating
  valid.sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    const ar = a.rating ?? -1;
    const br = b.rating ?? -1;
    return br - ar;
  });

  return valid[0];
}

function hasNonEmptySpecs(specs) {
  if (!specs || typeof specs !== "object") return false;
  return Object.keys(specs).length > 0;
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

  useEffect(() => {
    saveCompareSelected(selectedIds);
  }, [selectedIds]);

  const removeId = (id) => {
    const next = selectedIds.filter((x) => x !== id);
    saveCompareSelected(next);

    const hadUrlIds = (sp.get("ids") || "").length > 0;
    if (hadUrlIds) {
      if (next.length) setSp({ ids: next.join(",") });
      else setSp({});
    } else {
      setSp((prev) => prev);
    }
  };

  useEffect(() => {
    let alive = true;

    async function fetchJson(url) {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    }

    async function run() {
      setLoading(true);
      setError("");
      setProducts([]);
      setFilters(null);

      if (selectedIds.length < 2) {
        setLoading(false);
        return;
      }

      try {
        // 1) Fetch compare payload
        const compareUrl = `${API_BASE}${withFilters(
          `/compare?ids=${selectedIds.join(",")}`
        )}`;
        const compareData = await fetchJson(compareUrl);

        const rawProducts = Array.isArray(compareData?.products)
          ? compareData.products
          : [];

        // 2) Fetch /products/:id for fallback (ONLY when needed)
        // Need fallback if:
        // - no offers/bestOffer in compare (for price)
        // - missing/empty specs in compare (for specs)
        const needsDetail = rawProducts.filter((p) => {
          const compareBest = Number(p?.bestOffer?.price);
          const hasCompareBest = Number.isFinite(compareBest) && compareBest > 0;

          const compareOffers = Array.isArray(p?.offers) ? p.offers : [];
          const hasCompareOffers = compareOffers.some(
            (o) => Number.isFinite(Number(o?.price)) && Number(o.price) > 0
          );

          const needsPrice = !(hasCompareBest || hasCompareOffers);
          const needsSpecs = !hasNonEmptySpecs(p?.specs);

          return needsPrice || needsSpecs;
        });

        const detailById = new Map();

        await Promise.all(
          needsDetail.map(async (p) => {
            const id = p?.id;
            if (!id) return;

            try {
              const detailUrl = `${API_BASE}${withFilters(`/products/${id}`)}`;
              const detail = await fetchJson(detailUrl);
              detailById.set(id, detail);
            } catch {
              // ignore
            }
          })
        );

        // 3) Enrich products:
        // - If compare already has offers, keep them
        // - Else compute best offer from detail.offers
        // - If compare already has specs, keep them
        // - Else use detail.specs
        const enriched = rawProducts.map((p) => {
          const compareOffers = Array.isArray(p?.offers) ? p.offers : [];
          const compareBest = Number(p?.bestOffer?.price);
          const hasCompareBest = Number.isFinite(compareBest) && compareBest > 0;

          const hasCompareOffers = compareOffers.some(
            (o) => Number.isFinite(Number(o?.price)) && Number(o.price) > 0
          );

          const detail = detailById.get(p.id);

          // ----- PRICE / OFFERS -----
          let finalOffers = compareOffers;
          let finalBestOffer = null;

          if (hasCompareBest) {
            finalBestOffer = {
              source: p.bestOffer?.source || "",
              price: Number(p.bestOffer.price),
              rating: p.bestOffer?.rating ?? null,
              url: p.bestOffer?.url ?? null,
            };
          } else if (hasCompareOffers) {
            finalBestOffer = bestOfferFromOffers(compareOffers);
          } else {
            // fallback to detail offers
            const detailOffers = Array.isArray(detail?.offers) ? detail.offers : [];
            finalOffers = detailOffers;
            finalBestOffer = bestOfferFromOffers(detailOffers);
          }

          // ----- SPECS -----
          const compareSpecs = p?.specs;
          const detailSpecs = detail?.specs;

          const finalSpecs = hasNonEmptySpecs(compareSpecs)
            ? compareSpecs
            : hasNonEmptySpecs(detailSpecs)
            ? detailSpecs
            : null;

          return {
            ...p,
            offers: finalOffers,
            bestOffer: finalBestOffer || {
              source: "",
              price: null,
              rating: null,
              url: null,
            },
            specs: finalSpecs,
            _displayPrice: finalBestOffer?.price ?? null,
            _priceLabel: finalBestOffer ? "Best offer" : "Original price",
          };
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
    return () => {
      alive = false;
    };
  }, [selectedIds, sp, setSp]);

  const comparisonRows = useMemo(() => {
    const rows = [];

    // Base rows
    const base = [
      ["Brand", (p) => p.brand],
      ["Category", (p) => normalizeCategory(p.category)],
      ["Price", (p) => money(p._displayPrice)],
      ["Store", (p) => (p?.bestOffer?.source ? p.bestOffer.source : "—")],
      ["Rating", (p) =>
        p?.bestOffer?.rating != null ? Number(p.bestOffer.rating).toFixed(1) : "—"
      ],
    ];

    for (const [label, fn] of base) {
      rows.push({ label, values: products.map((p) => fn(p) ?? "—") });
    }

    // Specs rows (match what you show on product details)
    const specKeys = [
      ["CPU", (p) => p?.specs?.cpu],
      ["GPU", (p) => p?.specs?.gpu],
      ["RAM (GB)", (p) => p?.specs?.ram],
      ["Storage (GB)", (p) => p?.specs?.storage],
      ["Screen size (in)", (p) => p?.specs?.screen_size ?? p?.specs?.display_size],
      ["Resolution", (p) => p?.specs?.resolution],
      ["Battery (hrs)", (p) => p?.specs?.battery_hours],
      ["Weight (lb)", (p) => p?.specs?.weight],
      ["Ports", (p) => p?.specs?.ports],
      ["OS", (p) => p?.specs?.os],
      ["ANC", (p) =>
        p?.specs?.anc === true ? "Yes" : p?.specs?.anc === false ? "No" : null
      ],
      ["Type", (p) => p?.specs?.type],
      ["Codec support", (p) => p?.specs?.codec_support],
      ["Multipoint", (p) =>
        p?.specs?.multipoint === true ? "Yes" : p?.specs?.multipoint === false ? "No" : null
      ],
      ["Review count", (p) => p?.specs?.review_count],
    ];

    for (const [label, fn] of specKeys) {
      const vals = products.map((p) => fn(p));
      const any = vals.some(
        (v) => v !== null && v !== undefined && String(v).trim() !== ""
      );
      if (any) {
        rows.push({ label, values: vals.map((v) => (v ?? "—")) });
      }
    }

    return rows;
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2">
                <Badge tone="blue">Compare</Badge>
                {filters?.condition ? (
                  <Badge tone="slate">Condition: {filters.condition}</Badge>
                ) : null}
              </div>

              <h1 className="mt-3 text-2xl md:text-3xl font-extrabold text-slate-900">
                Compare products
              </h1>

              <p className="mt-2 text-slate-600">
                Select at least <span className="font-semibold">2 products</span> from Home to compare.
              </p>

              <div className="mt-4">
                <Link to="/" className="text-indigo-700 font-semibold hover:underline">
                  ← Back to Home
                </Link>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500">Selected</div>
              <div className="text-2xl font-extrabold text-slate-900">
                {selectedIds.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
          <div className="font-extrabold">Error</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          Loading comparison…
        </div>
      ) : selectedIds.length < 2 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          No items selected. Go to{" "}
          <Link className="text-indigo-700 font-semibold hover:underline" to="/">
            Home
          </Link>{" "}
          and select 2–4 products.
        </div>
      ) : (
        <>
          {/* Selected cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {products.map((p) => {
              const cat = normalizeCategory(p.category);

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-slate-500 truncate">
                        {p.brand} • {cat}
                      </div>
                      <div className="mt-1 font-extrabold text-slate-900 leading-tight line-clamp-2">
                        {p.name}
                      </div>
                    </div>

                    <button
                      onClick={() => removeId(p.id)}
                      className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center justify-center"
                      title="Remove from comparison"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>

                  <img
                    src={resolveProductImage(p)}
                    alt={p.name}
                    className="h-44 w-full object-cover border-y border-slate-200"
                    loading="lazy"
                  />

                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {p?.bestOffer?.source ? (
                        <>
                          <Badge tone="blue">{p.bestOffer.source}</Badge>
                          {p.bestOffer.rating != null ? (
                            <Badge tone="green">⭐ {Number(p.bestOffer.rating).toFixed(1)}</Badge>
                          ) : null}
                        </>
                      ) : (
                        <Badge tone="slate">No offers</Badge>
                      )}
                    </div>

                    <div className="text-2xl font-extrabold text-slate-900">
                      {money(p._displayPrice)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {p._priceLabel}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <Link
                        to={`/product/${p.id}`}
                        className="text-indigo-700 font-semibold hover:underline"
                      >
                        View details →
                      </Link>

                      {p?.bestOffer?.url ? (
                        <a
                          href={p.bestOffer.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                        >
                          Shop now →
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">No link</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <div className="text-lg font-extrabold text-slate-900">
                Comparison table
              </div>
              <div className="text-sm text-slate-600">
                Side-by-side summary for the selected products.
              </div>
            </div>

            <div className="overflow-auto">
              <table className="min-w-[900px] w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left text-xs font-extrabold text-slate-600 px-4 py-3 border-b border-slate-200 w-56">
                      Field
                    </th>
                    {products.map((p) => (
                      <th
                        key={p.id}
                        className="text-left text-xs font-extrabold text-slate-600 px-4 py-3 border-b border-slate-200"
                      >
                        <div className="truncate">{p.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="odd:bg-white even:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700 border-b border-slate-200">
                        {row.label}
                      </td>
                      {row.values.map((v, idx) => (
                        <td
                          key={idx}
                          className="px-4 py-3 text-sm text-slate-900 border-b border-slate-200"
                        >
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
