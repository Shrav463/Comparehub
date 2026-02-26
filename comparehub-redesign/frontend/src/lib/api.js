// src/lib/api.js
// Centralized API base + filter handling.

// Support both variable names (older/newer configs)
export const API_BASE = (
    import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

function readJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "");
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

// Normalize store names so "BestBuy" and "Best Buy" both work.
function normalizeStoreName(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^bestbuy$/i, "Best Buy")
    .replace(/^best buy$/i, "Best Buy");
}

export function withFilters(path) {
  const url = new URL(path, API_BASE);

  // Condition
  const condition = localStorage.getItem("ch_condition") || "New";
  url.searchParams.set("condition", condition);

  // Stores
  const stored = readJSON("ch_stores", null);

  // Default stores (your UI promise)
  const core = ["Amazon", "Best Buy", "Walmart"];
  let stores = Array.isArray(stored) ? stored.filter(Boolean) : [];

  // Normalize + dedupe
  stores = stores.map(normalizeStoreName);
  stores = Array.from(new Set(stores));

  // Safety: if core stores are missing, add them back
  const hasAnyCore = stores.some((s) => core.includes(s));
  if (!hasAnyCore) stores = [...core];

  url.searchParams.set("stores", stores.join(","));

  // return only pathname+search (keeps your API_BASE usage consistent)
  return url.pathname + url.search;
}
