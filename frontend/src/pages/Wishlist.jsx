import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { resolveProductImage } from "../lib/resolveProductImage";

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

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => loadWishlist());

  // Keep in sync if user adds/removes in another tab or page
  useEffect(() => {
    const onStorage = () => setItems(loadWishlist());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const count = useMemo(() => items.length, [items]);

  const removeItem = (id) => {
    const next = items.filter((x) => String(x.id) !== String(id));
    saveWishlist(next);
    setItems(next);
  };

  const clearAll = () => {
    if (!confirm("Clear all items from wishlist?")) return;
    saveWishlist([]);
    setItems([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Wishlist
            </h1>
            <p className="text-white/60 mt-1">
              Saved products you want to compare later.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              ← Back
            </button>

            <button
              onClick={clearAll}
              disabled={items.length === 0}
              className="rounded-xl border border-rose-500/30 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-white/70">
          Total saved: <span className="text-white font-semibold">{count}</span>
        </div>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="text-lg font-bold">Your wishlist is empty</div>
          <div className="text-white/60 mt-2">
            Open a product and click <span className="font-semibold">“Add to Wishlist”</span>.
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center mt-5 rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400 transition"
          >
            Browse products →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <div
              key={p.id}
              className="group rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition"
            >
              <Link to={`/product/${p.id}`} className="block">
                <div className="relative">
                  <img
                    src={resolveProductImage(p)}
                    alt={p.name}
                    className="h-40 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="text-xs text-white/70">
                      {p.brand} • {p.category}
                    </div>
                    <div className="text-lg font-extrabold tracking-tight">
                      {p.name}
                    </div>
                  </div>
                </div>
              </Link>

              <div className="p-4 flex items-center justify-between gap-3">
                <Link
                  to={`/product/${p.id}`}
                  className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                >
                  View product →
                </Link>

                <button
                  onClick={() => removeItem(p.id)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10 transition"
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