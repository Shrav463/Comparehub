import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resolveProductImage } from "../lib/resolveProductImage";
import { normalizeCategory } from "../lib/normalizeCategory";
import { API_BASE, withFilters } from "../lib/api";

function loadWishlist() {
  try {
    return JSON.parse(localStorage.getItem("wishlist") || "[]");
  } catch {
    return [];
  }
}

function saveWishlist(list) {
  localStorage.setItem("wishlist", JSON.stringify(list));
}

function formatVal(v) {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.join(", ");
  const n = Number(v);
  if (typeof v === "number" || (!Number.isNaN(n) && String(v).trim() !== "")) return String(v);
  return String(v);
}

function getSpecRows(category) {
  const base = [
    ["Chipset / CPU", "chipset", "cpu"],
    ["RAM", "ram"],
    ["Storage", "storage"],
  ];
  if (category === "Phones") {
    return [
      ["Chipset", "chipset"],
      ["RAM (GB)", "ram"],
      ["Storage (GB)", "storage"],
      ["Display size (in)", "display_size"],
      ["Refresh rate (Hz)", "refresh_rate"],
      ["Main camera (MP)", "camera_main_mp"],
      ["Battery (mAh)", "battery_mah"],
      ["Charging (W)", "charging_watts"],
      ["5G", "5g"],
      ["OS", "os_version"],
    ];
  }
  if (category === "Laptops") {
    return [
      ["CPU", "cpu"],
      ["GPU", "gpu"],
      ["RAM (GB)", "ram"],
      ["Storage (GB)", "storage"],
      ["Screen size (in)", "screen_size"],
      ["Resolution", "resolution"],
      ["Battery (hrs)", "battery_hours"],
      ["Weight (lb)", "weight"],
      ["Ports", "ports"],
      ["OS", "os"],
    ];
  }

  if (category === "Headphones") {
    return [
      ["Type", "type"],
      ["ANC", "anc"],
      ["Battery (hrs)", "battery_hours"],
      ["Multipoint", "multipoint"],
      ["Codec support", "codec_support"],
    ];
  }

  return base;
}

export default function Product() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [offerSort, setOfferSort] = useState("low"); // low | high | rating
  const [loading, setLoading] = useState(true);

  const normalizedCategory = useMemo(() => normalizeCategory(p?.category), [p?.category]);

  const [wishlist, setWishlist] = useState(() => loadWishlist());

  const isWishlisted = useMemo(() => {
    return wishlist.some((x) => String(x.id) === String(id));
  }, [wishlist, id]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}${withFilters(`/products/${id}`)}`)
      .then((r) => r.json())
      .then(setP)
      .catch(console.error)
      .finally(() => setLoading(false));
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

    if (current.some((x) => String(x.id) === String(id))) {
      const next = current.filter((x) => String(x.id) !== String(id));
      saveWishlist(next);
      setWishlist(next);
      alert("Removed from wishlist");
      return;
    }

    const item = {
      id: p?.id,
      name: p?.name,
      imageUrl: p?.imageUrl,
      brand: p?.brand,
      category: p?.category,
    };

    const next = [item, ...current].slice(0, 50);
    saveWishlist(next);
    setWishlist(next);
    alert("Added to wishlist ✅");
  };

  // ✅ TRACK + OPEN helper
  const trackAndOpen = async (url, storeName) => {
    try {
      await fetch(`${API_BASE}/track/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: Number(p?.id),
          storeName,
          url,
        }),
      });
    } catch (e) {
      // Tracking should never block the user
      console.error("Track click failed:", e);
    } finally {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 w-2/3 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
            <div className="h-20 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-10 w-40 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-56 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!p || p.error) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-lg font-bold text-slate-900">Product not found</div>
        <div className="text-slate-600 mt-1">Go back to Home and select a product again.</div>
        <Link to="/" className="inline-block mt-4 text-indigo-700 font-semibold">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-2">
        <span className="text-lg">←</span> Back
      </Link>

      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <img src={resolveProductImage(p)} alt={p.name} className="h-80 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-xs text-white/80">
              {p.brand} • {normalizedCategory}
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-white">{p.name}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-900">{p.name}</div>
              <div className="text-sm text-slate-600 mt-1">
                {p.brand} • {normalizedCategory}
              </div>
            </div>

            <button
              onClick={toggleWishlist}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition border
                ${
                  isWishlisted
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100"
                }`}
              title="Save to wishlist"
            >
              {isWishlisted ? "♥ Wishlisted" : "♡ Add to Wishlist"}
            </button>
          </div>

          <p className="text-slate-700 mt-4 leading-relaxed">
            {p.description || "No description provided."}
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-600">Best price</div>
              <div className="text-xl font-extrabold text-slate-900">
                {bestOffer ? `$${Number(bestOffer.price).toFixed(2)}` : "—"}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {bestOffer
                  ? `${bestOffer.source} • ⭐ ${Number(bestOffer.rating || 0).toFixed(1)}`
                  : "No offers yet"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs text-slate-600">How to buy</div>
              <div className="text-sm text-slate-700 mt-1">
                Compare offers below, then click <span className="font-semibold">Visit website</span> to purchase.
              </div>
            </div>
          </div>

          {bestOffer?.url ? (
            <button
              onClick={() => trackAndOpen(bestOffer.url, bestOffer.source)}
              className="inline-flex items-center justify-center mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 transition"
            >
              Buy at best price →
            </button>
          ) : (
            <button
              disabled
              className="inline-flex items-center justify-center mt-5 w-full rounded-xl bg-indigo-200 px-4 py-3 font-semibold text-white cursor-not-allowed"
            >
              Buy at best price →
            </button>
          )}
        </div>
      </div>

      {/* Specs */}
      {p.specs ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xl font-extrabold tracking-tight text-slate-900">Specs & Comparison details</div>
                <div className="text-sm text-slate-600">Category-specific specs used in the Compare page.</div>
              </div>
              {p.lastUpdated ? (
                <div className="text-xs text-slate-500">Last updated: {p.lastUpdated}</div>
              ) : null}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {getSpecRows(normalizedCategory).map((row) => {
                    const label = row[0];
                    const keys = row.slice(1);
                    let val = "—";
                    for (const k of keys) {
                      if (p.specs && Object.prototype.hasOwnProperty.call(p.specs, k)) {
                        val = formatVal(p.specs[k]);
                        break;
                      }
                    }
                    return (
                      <tr key={label} className="border-t border-slate-200">
                        <td className="py-3 pr-4 font-semibold text-slate-700 whitespace-nowrap">{label}</td>
                        <td className="py-3 text-slate-900">{val}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold text-slate-900">Highlights</div>

            {Array.isArray(p.specs?.key_features) && p.specs.key_features.length ? (
              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-600">Key features</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.specs.key_features.map((x, idx) => (
                    <span key={idx} className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-4">
              {Array.isArray(p.specs?.pros) && p.specs.pros.length ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-xs font-semibold text-emerald-800">Pros</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-emerald-900 space-y-1">
                    {p.specs.pros.map((x, idx) => (
                      <li key={idx}>{x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {Array.isArray(p.specs?.cons) && p.specs.cons.length ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <div className="text-xs font-semibold text-rose-800">Cons</div>
                  <ul className="mt-2 list-disc pl-5 text-sm text-rose-900 space-y-1">
                    {p.specs.cons.map((x, idx) => (
                      <li key={idx}>{x}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Offers header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xl font-extrabold tracking-tight text-slate-900">Offers from top websites</div>
          <div className="text-sm text-slate-600">Sort offers by price or rating.</div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Sort:</span>
          <select
            value={offerSort}
            onChange={(e) => setOfferSort(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Price: Low → High</option>
            <option value="high">Price: High → Low</option>
            <option value="rating">Rating: High → Low</option>
          </select>
        </div>
      </div>

      {/* Offers list */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 text-xs text-slate-600 border-b border-slate-200 bg-slate-50">
          <div className="col-span-3">Website</div>
          <div className="col-span-3">Price</div>
          <div className="col-span-2">Rating</div>
          <div className="col-span-4 text-right">Action</div>
        </div>

        {offers.map((o, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 border-b border-slate-100 last:border-b-0"
          >
            <div className="md:col-span-3 flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 border border-slate-200">
                {o.source?.slice(0, 1) || "S"}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{o.source}</div>
              </div>
            </div>

            <div className="md:col-span-3 font-bold text-slate-900">
              ${Number(o.price).toFixed(2)}
            </div>

            <div className="md:col-span-2 text-slate-700">
              {o.rating != null ? `⭐ ${Number(o.rating).toFixed(1)}` : "—"}
            </div>

            <div className="md:col-span-4 md:text-right">
              <button
                onClick={() => trackAndOpen(o.url, o.source)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition w-full md:w-auto"
              >
                Visit website →
              </button>
            </div>
          </div>
        ))}

        {offers.length === 0 && (
          <div className="px-5 py-6 text-slate-600">No offers available for this product yet.</div>
        )}
      </div>
    </div>
  );
}