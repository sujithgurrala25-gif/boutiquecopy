import { boutiqueProducts } from "./data.js";

const KEYS = {
  users: "stitchaura_users",
  session: "stitchaura_session",
  draft: "stitchaura_order_draft",
  orders: "stitchaura_orders",
  feedback: "stitchaura_feedback",
  products: "stitchaura_products",
  carts: "stitchaura_carts",
  wishlists: "stitchaura_wishlists",
};

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now()}`;
}

export function getUsers() {
  return read(KEYS.users, []);
}

export function saveUsers(users) {
  write(KEYS.users, users);
}

export function getSession() {
  return read(KEYS.session, null);
}

export function saveSession(user) {
  write(KEYS.session, user);
}

export function clearSession() {
  localStorage.removeItem(KEYS.session);
}

export function getDraft(userId) {
  const allDrafts = read(KEYS.draft, {});
  return allDrafts[userId] || {};
}

export function saveDraft(userId, updates) {
  const allDrafts = read(KEYS.draft, {});
  const nextDraft = { ...allDrafts[userId], ...updates };
  write(KEYS.draft, { ...allDrafts, [userId]: nextDraft });
  return nextDraft;
}

export function replaceDraft(userId, draft) {
  const allDrafts = read(KEYS.draft, {});
  write(KEYS.draft, { ...allDrafts, [userId]: draft });
}

export function clearDraft(userId) {
  const allDrafts = read(KEYS.draft, {});
  delete allDrafts[userId];
  write(KEYS.draft, allDrafts);
}

export function getOrders() {
  return read(KEYS.orders, []);
}

export function saveOrders(orders) {
  write(KEYS.orders, orders);
}

export function addOrder(order) {
  const orders = getOrders();
  saveOrders([order, ...orders]);
}

export function getOrderById(orderId) {
  return getOrders().find((order) => order.id === orderId);
}

export function updateOrderStatus(orderId, status) {
  const updatedOrders = getOrders().map((order) =>
    order.id === orderId ? { ...order, status } : order
  );
  saveOrders(updatedOrders);
  return updatedOrders;
}

export function deleteOrder(orderId) {
  const updatedOrders = getOrders().filter((order) => order.id !== orderId);
  saveOrders(updatedOrders);
  return updatedOrders;
}

export function getFeedback() {
  return read(KEYS.feedback, []);
}

export function addFeedback(feedback) {
  const feedbackList = getFeedback();
  write(KEYS.feedback, [feedback, ...feedbackList]);
}

export function getProducts() {
  const storedProducts = localStorage.getItem(KEYS.products);
  if (!storedProducts) {
    write(KEYS.products, boutiqueProducts);
    return boutiqueProducts;
  }
  return read(KEYS.products, boutiqueProducts);
}

export function saveProducts(products) {
  write(KEYS.products, products);
}

export function addProduct(product) {
  const products = getProducts();
  const nextProducts = [{ ...product, id: createId("product") }, ...products];
  saveProducts(nextProducts);
  return nextProducts;
}

export function updateProduct(productId, updates) {
  const nextProducts = getProducts().map((product) =>
    product.id === productId ? { ...product, ...updates } : product
  );
  saveProducts(nextProducts);
  return nextProducts;
}

export function deleteProduct(productId) {
  const nextProducts = getProducts().filter((product) => product.id !== productId);
  saveProducts(nextProducts);
  return nextProducts;
}

export function getCart(userId) {
  const carts = read(KEYS.carts, {});
  return carts[userId] || [];
}

export function addToCart(userId, product) {
  const carts = read(KEYS.carts, {});
  const currentCart = carts[userId] || [];
  const exists = currentCart.some((item) => item.id === product.id);
  const nextCart = exists ? currentCart : [{ ...product, quantity: 1 }, ...currentCart];
  write(KEYS.carts, { ...carts, [userId]: nextCart });
  return nextCart;
}

export function removeFromCart(userId, productId) {
  const carts = read(KEYS.carts, {});
  const nextCart = (carts[userId] || []).filter((item) => item.id !== productId);
  write(KEYS.carts, { ...carts, [userId]: nextCart });
  return nextCart;
}

export function getWishlist(userId) {
  const wishlists = read(KEYS.wishlists, {});
  return wishlists[userId] || [];
}

export function toggleWishlist(userId, product) {
  const wishlists = read(KEYS.wishlists, {});
  const currentWishlist = wishlists[userId] || [];
  const exists = currentWishlist.some((item) => item.id === product.id);
  const nextWishlist = exists
    ? currentWishlist.filter((item) => item.id !== product.id)
    : [{ ...product }, ...currentWishlist];
  write(KEYS.wishlists, { ...wishlists, [userId]: nextWishlist });
  return nextWishlist;
}
