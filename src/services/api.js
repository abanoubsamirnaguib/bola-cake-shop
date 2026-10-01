/**
 * API service for the Sucre backend.
 */

import { API_BASE_URL } from '../config';

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${endpoint}`);
  }
  return res.json();
}

// ─── Public API functions ─────────────────────────────────────────────────────

/**
 * Fetch all active banner slides for the homepage slider.
 * Returns an array of: { id, image_url, link_url, title, subtitle, sort_order }
 */
export async function fetchBannerSlides() {
  return apiFetch('/banner-slides');
}

/**
 * Fetch all active categories from the backend.
 * Returns an array of category objects shaped for the Ionic frontend:
 *   { id, name, slug, cover_image, tagline, products_count }
 */
export async function fetchCategories() {
  return apiFetch('/categories');
}

/**
 * Fetch a single category by slug.
 */
export async function fetchCategory(slug) {
  return apiFetch(`/categories/${slug}`);
}

/**
 * Fetch products for a category.
 * @param {string} categorySlug
 * @param {Object} params  - { search, featured, sort, direction, per_page, page }
 *
 * Returns a Laravel paginated response:
 *   { data: [...], current_page, last_page, total, per_page }
 *
 * Each product is pre-mapped by the backend to:
 *   { id, slug, title, image, price, reviews, description, attributes, fragrance_notes, … }
 */
export async function fetchProducts(categorySlug, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null))
  ).toString();

  const endpoint = `/categories/${categorySlug}/products${qs ? `?${qs}` : ''}`;
  return apiFetch(endpoint);
}

/**
 * Fetch all unique tags for products in a category.
 * Cached for 60 minutes (same as categories).
 * Returns a plain string array, e.g. ["Floral", "Oud", "Oriental"]
 */
export async function fetchCategoryTags(categorySlug) {
  return apiFetch(`/categories/${categorySlug}/tags`);
}

/**
 * Fetch featured products across all categories.
 * @param {number} perPage  - Max number of featured products to return (default 10)
 */
export async function fetchFeaturedProducts(perPage = 10) {
  return apiFetch(`/products/featured?per_page=${perPage}`);
}

/**
 * Fetch suggested products across all categories.
 * @param {number} perPage  - Max number of suggested products to return (default 10)
 */
export async function fetchSuggestedProducts(perPage = 10) {
  return apiFetch(`/products/suggested?per_page=${perPage}`);
}

/**
 * Fetch a single product by slug.
 */
export async function fetchProduct(productSlug) {
  return apiFetch(`/products/${productSlug}`);
}

/**
 * Validate a discount code.
 * @param {string} code
 * @param {number} amount  - Cart total before discount
 */
export async function validateDiscountCode(code, amount) {
  const res = await fetch(`${API_BASE_URL}/discount-codes/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, amount }),
  });
  return res.json();
}

/**
 * Fetch all public settings as a key→value map.
 * e.g. { whatsapp_phone: '201068644570', shop_name: 'Sucre' }
 */
export async function fetchSettings() {
  return apiFetch('/settings');
}

/**
 * Send a WhatsApp order message.
 */
export async function sendWhatsappMessage(payload) {
  const res = await fetch(`${API_BASE_URL}/whatsapp-messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
