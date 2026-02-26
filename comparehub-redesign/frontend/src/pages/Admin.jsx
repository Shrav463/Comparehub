import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { resolveProductImage } from "../lib/resolveProductImage";
import { API_BASE, withFilters } from "../lib/api";

export default function Admin() {
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  // If not logged in, go to login page
  if (!token) return <Navigate to="/login" replace />;

  // -----------------------------
  // State
  // -----------------------------
  const [products, setProducts] = useState([]);

  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    imageUrl: "",
  });

  const [offerForm, setOfferForm] = useState({
    productId: "",
    storeName: "",
    price: "",
    rating: "",
    url: "",
  });

  const [specProductId, setSpecProductId] = useState("");
  const [specJSON, setSpecJSON] = useState(
    `{
  "review_count": 0,
  "key_features": [],
  "pros": [],
  "cons": [],
  "chipset": "",
  "ram": 0,
  "storage": 0,
  "display_size": 0,
  "refresh_rate": 0,
  "camera_main_mp": 0,
  "battery_mah": 0,
  "charging_watts": 0,
  "5g": false,
  "os_version": ""
}
`
  );

  // -----------------------------
  // Helpers
  // -----------------------------
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const handleAuthError = async (res) => {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      nav("/login");
      return true;
    }
    return false;
  };

  // -----------------------------
  // Load products
  // -----------------------------
  const loadProducts = () => {
    fetch(`${API_BASE}${withFilters(`/products`)}`)
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };

  // -----------------------------
  // Sync Now (auto-import)
  // -----------------------------
  const syncNow = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/sync-now`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (await handleAuthError(res)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");

      alert("✅ Sync completed!");
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  // -----------------------------
  // Add Product
  // -----------------------------
  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(productForm),
      });

      if (await handleAuthError(res)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      alert(`✅ Product added (ID: ${data.id})`);
      setProductForm({
        name: "",
        brand: "",
        category: "",
        description: "",
        imageUrl: "",
      });
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  // -----------------------------
  // Add Offer
  // -----------------------------
  const addOffer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        productId: Number(offerForm.productId),
        storeName: offerForm.storeName,
        price: Number(offerForm.price),
        rating: offerForm.rating ? Number(offerForm.rating) : null,
        url: offerForm.url,
      };

      const res = await fetch(`${API_BASE}/admin/offers`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (await handleAuthError(res)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      alert("✅ Offer added");
      setOfferForm({
        productId: "",
        storeName: "",
        price: "",
        rating: "",
        url: "",
      });
      loadProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  // -----------------------------
  // Upsert Specs (JSON)
  // -----------------------------
  const upsertSpecs = async (e) => {
    e.preventDefault();
    try {
      const productId = Number(specProductId);
      if (!productId) throw new Error("Please enter a valid product ID");

      let specObj;
      try {
        specObj = JSON.parse(specJSON);
      } catch {
        throw new Error("Specs JSON is not valid JSON");
      }

      const res = await fetch(`${API_BASE}/admin/specs`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ productId, specs: specObj }),
      });

      if (await handleAuthError(res)) return;

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      alert("✅ Specs saved");
    } catch (err) {
      alert(err.message);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h2>
          <p className="text-slate-600 mt-1">
            Manage products, offers, and run imports (secured with JWT).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={syncNow}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            🔄 Sync Now
          </button>
          <button
            onClick={logout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Add Product */}
        <form onSubmit={addProduct} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <h3 className="text-lg font-extrabold text-slate-900">Add Product</h3>

          <div className="mt-3 space-y-3">
            {["name", "brand", "category", "imageUrl"].map((k) => (
              <input
                key={k}
                value={productForm[k]}
                onChange={(e) => setProductForm({ ...productForm, [k]: e.target.value })}
                placeholder={k}
                required={k === "name"}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ))}

            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="description"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[110px]"
            />

            <button className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 transition">
              Add Product →
            </button>
          </div>
        </form>

        {/* Add Offer */}
        <form onSubmit={addOffer} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <h3 className="text-lg font-extrabold text-slate-900">Add Offer</h3>

          <div className="mt-3 space-y-3">
            <select
              value={offerForm.productId}
              onChange={(e) => setOfferForm({ ...offerForm, productId: e.target.value })}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.name}
                </option>
              ))}
            </select>

            {["storeName", "price", "rating", "url"].map((k) => (
              <input
                key={k}
                value={offerForm[k]}
                onChange={(e) => setOfferForm({ ...offerForm, [k]: e.target.value })}
                placeholder={k}
                required={k !== "rating"}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ))}

            <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 transition">
              Add Offer →
            </button>
          </div>
        </form>
      </div>

      {/* Upsert Specs */}
      <form onSubmit={upsertSpecs} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Add/Update Specs (JSON)</h3>
            <p className="text-sm text-slate-600 mt-1">
              Paste category-specific specs to enable deep comparisons. (Stored in <span className="font-semibold">product_specs</span>.)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSpecJSON(
              `{
  "review_count": 0,
  "key_features": [],
  "pros": [],
  "cons": [],
  "cpu": "",
  "gpu": "",
  "ram": 0,
  "storage": 0,
  "screen_size": 0,
  "resolution": "",
  "battery_hours": 0,
  "weight": 0,
  "ports": [],
  "os": ""
}
`
            )}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
          >
            Use Laptop template
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Product</label>
            <select
              value={specProductId}
              onChange={(e) => setSpecProductId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.name}
                </option>
              ))}
            </select>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setSpecJSON(
                  `{
  "review_count": 0,
  "key_features": [],
  "pros": [],
  "cons": [],
  "chipset": "",
  "ram": 0,
  "storage": 0,
  "display_size": 0,
  "refresh_rate": 0,
  "camera_main_mp": 0,
  "battery_mah": 0,
  "charging_watts": 0,
  "5g": false,
  "os_version": ""
}
`
                )}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                Phone template
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                Save specs
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Specs JSON</label>
            <textarea
              value={specJSON}
              onChange={(e) => setSpecJSON(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500 min-h-[220px]"
              spellCheck={false}
            />
            <div className="mt-2 text-xs text-slate-500">
              Tip: include <span className="font-semibold">review_count</span>, <span className="font-semibold">key_features</span>, <span className="font-semibold">pros</span>, and <span className="font-semibold">cons</span> to make the Product page look more “real”.
            </div>
          </div>
        </div>
      </form>

      {/* Product overview */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold text-slate-900">Products (Quick View)</h3>
          <button
            onClick={loadProducts}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 last:border-b-0 last:pb-0">
              <div>
                <div className="font-semibold text-slate-900">{p.name}</div>
                <div className="text-xs text-slate-600">{p.category}</div>
              </div>

              <div className="text-sm text-slate-700">
                Best: <span className="font-bold text-slate-900">${Number(p.bestPrice || 0).toFixed(2)}</span>{" "}
                <span className="text-slate-500">{p.bestSource ? `• ${p.bestSource}` : ""}</span>
              </div>
            </div>
          ))}

          {products.length === 0 && <div className="text-slate-600">No products yet.</div>}
        </div>
      </div>
    </div>
  );
}