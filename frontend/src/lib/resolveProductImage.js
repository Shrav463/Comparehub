import { ASSET_IMAGES, FALLBACK_PRODUCT_IMAGE } from "../assets";

function norm(s) {
  return String(s ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9+ ]/g, "")
    .trim();
}

/**
 * Resolve an image for a product.
 * - First try local bundled assets (by product name / model-like match)
 * - Then fall back to product.imageUrl/image_url from API
 * - Finally fall back to a generic bundled placeholder to avoid broken images
 */
export function resolveProductImage(product) {
  const name = norm(product?.name);
  const brand = norm(product?.brand);
  const model = norm(product?.model);

  // Try exact / near-exact matches (keys are lowercased in ASSET_IMAGES)
  const direct =
    ASSET_IMAGES[name] ||
    ASSET_IMAGES[model] ||
    ASSET_IMAGES[`${brand} ${model}`.trim()];
  if (direct) return direct;

  // Try contains matching for known catalog keys
  for (const key of Object.keys(ASSET_IMAGES)) {
    if ((name && name.includes(key)) || (model && model.includes(key))) return ASSET_IMAGES[key];
  }

  // API-provided image URLs
  const remote = product?.imageUrl || product?.image_url || product?.image || "";
  if (remote) return remote;

  // Always return a valid image to prevent broken UI icons
  return FALLBACK_PRODUCT_IMAGE;
}
