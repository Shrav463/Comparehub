// src/lib/normalizeCategory.js
// Normalizes category strings so UI + API filters stay consistent.
// Handles case differences and separators like hyphens/underscores.

// src/lib/normalizeCategory.js
export function normalizeCategory(cat) {
  const c = String(cat || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " "); // handles hyphen/underscore

  if (["phone", "phones", "mobile", "mobiles"].includes(c)) return "Phones";
  if (["laptop", "laptops", "notebook", "notebooks"].includes(c)) return "Laptops";
  if (["headphone", "headphones", "earbuds", "earphones"].includes(c)) return "Headphones";

  if (!cat) return "Other";
  return String(cat).trim();
}

