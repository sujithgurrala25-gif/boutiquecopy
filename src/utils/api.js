/**
 * Central API client for Dhanvika Boutique frontend.
 * All calls go to the Express backend at API_BASE.
 * JWT token is read from localStorage on every call.
 */

const API_BASE = "http://127.0.0.1:4000/api";
const TOKEN_KEY = "stitchaura_token";

/** Retrieve stored JWT token */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

/** Persist JWT token after login/signup */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Remove token on logout */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Build headers — always JSON, adds Bearer token if available */
function buildHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/** Core fetch wrapper — throws on non-ok responses */
async function request(method, path, body) {
  const options = {
    method,
    headers: buildHeaders(),
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const apiGet    = (path)        => request("GET",    path);
export const apiPost   = (path, body)  => request("POST",   path, body);
export const apiPut    = (path, body)  => request("PUT",    path, body);
export const apiDelete = (path)        => request("DELETE", path);

// ── Auth ───────────────────────────────────────────────────────
export const authSignup = (data)  => apiPost("/auth/signup", data);
export const authLogin  = (data)  => apiPost("/auth/login",  data);
export const authLogout = ()      => apiPost("/auth/logout",  {});

// ── Orders ─────────────────────────────────────────────────────
export const fetchOrders     = ()           => apiGet("/orders");
export const fetchOrderById  = (id)         => apiGet(`/orders/${id}`);
export const createOrder     = (data)       => apiPost("/orders", data);
export const updateOrderStatus = (id, status) => apiPut(`/orders/${id}/status`, { status });
export const deleteOrder     = (id)         => apiDelete(`/orders/${id}`);

// ── Products ───────────────────────────────────────────────────
export const fetchProducts   = ()           => apiGet("/products");
export const createProduct   = (data)       => apiPost("/products", data);
export const updateProduct   = (id, data)   => apiPut(`/products/${id}`, data);
export const deleteProduct   = (id)         => apiDelete(`/products/${id}`);

// ── Feedback ───────────────────────────────────────────────────
export const fetchFeedback   = ()           => apiGet("/feedback");
export const createFeedback  = (data)       => apiPost("/feedback", data);
export const deleteFeedback  = (id)         => apiDelete(`/feedback/${id}`);

// ── Users ──────────────────────────────────────────────────────
export const fetchUsers      = ()           => apiGet("/users");

// ── Cart ───────────────────────────────────────────────────────
export const fetchCart          = ()          => apiGet("/cart");
export const addToCartApi       = (productId) => apiPost("/cart", { product_id: productId });
export const removeFromCartApi  = (productId) => apiDelete(`/cart/${productId}`);

// ── Wishlist ───────────────────────────────────────────────────
export const fetchWishlist      = ()          => apiGet("/wishlist");
export const toggleWishlistApi  = (productId) => apiPost(`/wishlist/${productId}`);
