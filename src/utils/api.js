import { auth } from "./firebase.js";

const TOKEN_KEY = "stitchaura_token";

/** Retrieve stored JWT/Firebase token */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

/** Persist token after login/signup */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Remove token on logout */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Default Product Seed Data ─────────────────────────────────
const DEFAULT_PRODUCTS = [
  {
    id: "product-blouse-001",
    name: "Designer Blouse Stitching",
    category: "Blouse",
    price: 1600,
    stock: 18,
    description: "Premium blouse stitching with custom neck, sleeve, lining, and fitting options.",
  },
  {
    id: "product-kurti-001",
    name: "Elegant Kurti Stitching",
    category: "Kurti",
    price: 1900,
    stock: 24,
    description: "Comfortable daily or festive kurti stitching based on exact body measurements.",
  },
  {
    id: "product-frock-001",
    name: "Long Frock Stitching",
    category: "Long Frock",
    price: 2600,
    stock: 12,
    description: "Flowing long frock design with graceful fall, neat finish, and modern silhouette.",
  },
  {
    id: "product-lehenga-001",
    name: "Bridal Lehenga Stitching",
    category: "Lehenga",
    price: 5200,
    stock: 8,
    description: "Occasion-ready lehenga stitching with lining, embroidery, tassels, and structured fit.",
  },
];

// Helper: Get or initialize products catalog from localStorage
function getProducts() {
  const raw = localStorage.getItem("stitchaura_products");
  if (!raw) {
    localStorage.setItem("stitchaura_products", JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  return JSON.parse(raw);
}

// Helper: Delay to simulate network latency
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Auth / Sync Profile ───────────────────────────────────────
export async function fetchCurrentUser() {
  await delay(100);
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    throw new Error("No authenticated Firebase user found.");
  }
  const email = firebaseUser.email;
  const role = email === "admin@stitchaura.com" ? "admin" : "user";
  return {
    ok: true,
    user: {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || email.split("@")[0],
      email: email,
      role: role,
      createdAt: firebaseUser.metadata.creationTime,
    },
  };
}

// ── Orders ─────────────────────────────────────────────────────
export async function fetchOrders() {
  await delay(200);
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("Unauthorized");

  const email = firebaseUser.email;
  const role = email === "admin@stitchaura.com" ? "admin" : "user";
  
  let allOrders = JSON.parse(localStorage.getItem("stitchaura_orders") || "[]");

  if (role !== "admin") {
    allOrders = allOrders.filter((o) => o.user_id === firebaseUser.uid);
  }

  return { ok: true, orders: allOrders };
}

export async function fetchOrderById(id) {
  await delay(100);
  const allOrders = JSON.parse(localStorage.getItem("stitchaura_orders") || "[]");
  const order = allOrders.find((o) => o.id === id);
  if (!order) throw new Error("Order not found.");
  return { ok: true, order };
}

export async function createOrder(data) {
  await delay(300);
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("Unauthorized");

  const allOrders = JSON.parse(localStorage.getItem("stitchaura_orders") || "[]");
  const orderId = `order-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const newOrder = {
    id: orderId,
    user_id: firebaseUser.uid,
    outfit_type: data.outfit_type,
    outfit_title: data.outfit_title || data.outfit_type,
    outfit_category: data.outfit_category || data.outfit_type,
    total_price: Number(data.total_price),
    neck_style: data.neck_style || null,
    sleeve_style: data.sleeve_style || null,
    fitting: data.fitting || null,
    extras: data.extras || [],
    notes: data.notes || null,
    fabric_image: data.fabric_image || null,
    customer_name: data.customer_name || firebaseUser.displayName || firebaseUser.email.split("@")[0],
    customer_email: data.customer_email || firebaseUser.email,
    customer_phone: data.customer_phone || null,
    unit: data.unit || "Inches",
    status: "Order Received",
    created_at: now,
    updated_at: now,
    // Nested mappings to match frontend layout expectations
    outfit: {
      title: data.outfit_title || data.outfit_type,
      category: data.outfit_category || data.outfit_type,
      id: (data.outfit_type || "").toLowerCase().replace(/\s+/g, "-"),
    },
    measurements: data.measurements || {},
    price: Number(data.total_price),
    createdAt: now,
    customization: {
      neckStyle: data.neck_style,
      sleeveStyle: data.sleeve_style,
      fittingStyle: data.fitting,
      extras: data.extras || [],
    },
  };

  allOrders.unshift(newOrder);
  localStorage.setItem("stitchaura_orders", JSON.stringify(allOrders));
  return { ok: true, order: newOrder };
}

export async function updateOrderStatus(id, status) {
  await delay(150);
  const allOrders = JSON.parse(localStorage.getItem("stitchaura_orders") || "[]");
  const order = allOrders.find((o) => o.id === id);
  if (!order) throw new Error("Order not found.");

  order.status = status;
  order.updated_at = new Date().toISOString();
  localStorage.setItem("stitchaura_orders", JSON.stringify(allOrders));

  return { ok: true, order };
}

export async function deleteOrder(id) {
  await delay(150);
  let allOrders = JSON.parse(localStorage.getItem("stitchaura_orders") || "[]");
  allOrders = allOrders.filter((o) => o.id !== id);
  localStorage.setItem("stitchaura_orders", JSON.stringify(allOrders));
  return { ok: true, message: "Order deleted." };
}

// ── Products ───────────────────────────────────────────────────
export async function fetchProducts() {
  await delay(150);
  return { ok: true, products: getProducts() };
}

export async function createProduct(data) {
  await delay(200);
  const products = getProducts();
  const newProduct = {
    id: `product-${Math.random().toString(36).substr(2, 9)}`,
    name: data.name,
    category: data.category,
    price: Number(data.price),
    stock: Number(data.stock || 0),
    description: data.description || "",
    image_url: data.image_url || null,
    created_at: new Date().toISOString(),
  };

  products.push(newProduct);
  localStorage.setItem("stitchaura_products", JSON.stringify(products));
  return { ok: true, product: newProduct };
}

export async function updateProduct(id, data) {
  await delay(200);
  const products = getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error("Product not found.");

  if (data.name !== undefined) product.name = data.name;
  if (data.category !== undefined) product.category = data.category;
  if (data.price !== undefined) product.price = Number(data.price);
  if (data.stock !== undefined) product.stock = Number(data.stock);
  if (data.description !== undefined) product.description = data.description;
  if (data.image_url !== undefined) product.image_url = data.image_url;

  localStorage.setItem("stitchaura_products", JSON.stringify(products));
  return { ok: true, product };
}

export async function deleteProduct(id) {
  await delay(150);
  let products = getProducts();
  products = products.filter((p) => p.id !== id);
  localStorage.setItem("stitchaura_products", JSON.stringify(products));
  return { ok: true, message: "Product deleted." };
}

// ── Feedback ───────────────────────────────────────────────────
export async function fetchFeedback() {
  await delay(150);
  const feedback = JSON.parse(localStorage.getItem("stitchaura_feedback") || "[]");
  return { ok: true, feedback };
}

export async function createFeedback(data) {
  await delay(200);
  const firebaseUser = auth.currentUser;
  const feedback = JSON.parse(localStorage.getItem("stitchaura_feedback") || "[]");
  
  const newFeedback = {
    id: `feedback-${Math.random().toString(36).substr(2, 9)}`,
    user_id: firebaseUser ? firebaseUser.uid : null,
    name: data.name || (firebaseUser ? firebaseUser.displayName : "Anonymous"),
    outfit_type: data.outfit_type,
    rating: Number(data.rating),
    message: data.message,
    created_at: new Date().toISOString(),
  };

  feedback.unshift(newFeedback);
  localStorage.setItem("stitchaura_feedback", JSON.stringify(feedback));
  return { ok: true, feedback: newFeedback };
}

export async function deleteFeedback(id) {
  await delay(150);
  let feedback = JSON.parse(localStorage.getItem("stitchaura_feedback") || "[]");
  feedback = feedback.filter((f) => f.id !== id);
  localStorage.setItem("stitchaura_feedback", JSON.stringify(feedback));
  return { ok: true, message: "Feedback deleted." };
}

// ── Users List (For Admin Dashboard) ───────────────────────────
export async function fetchUsers() {
  await delay(150);
  const allOrders = JSON.parse(localStorage.getItem("stitchaura_orders") || "[]");
  
  // Extract unique users dynamically from placed orders
  const usersMap = {};

  // Add the default admin profile
  usersMap["admin"] = {
    id: "admin",
    name: "Boutique Admin",
    email: "admin@stitchaura.com",
    role: "admin",
    created_at: new Date().toISOString(),
  };

  for (const order of allOrders) {
    if (order.user_id && !usersMap[order.user_id]) {
      usersMap[order.user_id] = {
        id: order.user_id,
        name: order.customer_name || "Customer",
        email: order.customer_email || "customer@example.com",
        role: "user",
        created_at: order.created_at,
      };
    }
  }

  return { ok: true, users: Object.values(usersMap) };
}

// ── Cart ───────────────────────────────────────────────────────
export async function fetchCart() {
  await delay(100);
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return { ok: true, cart: [] };

  const allCarts = JSON.parse(localStorage.getItem("stitchaura_carts") || "{}");
  const userCart = allCarts[firebaseUser.uid] || [];
  const products = getProducts();

  const enrichedCart = userCart
    .map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        name: product ? product.name : "Unknown Product",
        price: product ? product.price : 0,
        product: product || null,
      };
    })
    .filter((item) => item.product !== null);

  return { ok: true, cart: enrichedCart };
}

export async function addToCartApi(productId) {
  await delay(100);
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("Unauthorized");

  const allCarts = JSON.parse(localStorage.getItem("stitchaura_carts") || "{}");
  const userCart = allCarts[firebaseUser.uid] || [];

  const existingItem = userCart.find((item) => item.product_id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    userCart.push({
      id: `cart-${Math.random().toString(36).substr(2, 9)}`,
      product_id: productId,
      quantity: 1,
    });
  }

  allCarts[firebaseUser.uid] = userCart;
  localStorage.setItem("stitchaura_carts", JSON.stringify(allCarts));

  return { ok: true, message: "Product added to cart." };
}

export async function removeFromCartApi(productId) {
  await delay(100);
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("Unauthorized");

  const allCarts = JSON.parse(localStorage.getItem("stitchaura_carts") || "{}");
  let userCart = allCarts[firebaseUser.uid] || [];

  userCart = userCart.filter((item) => item.product_id !== productId);

  allCarts[firebaseUser.uid] = userCart;
  localStorage.setItem("stitchaura_carts", JSON.stringify(allCarts));

  return { ok: true, message: "Product removed from cart." };
}

// ── Wishlist ───────────────────────────────────────────────────
export async function fetchWishlist() {
  await delay(100);
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return { ok: true, wishlist: [] };

  const allWishlists = JSON.parse(localStorage.getItem("stitchaura_wishlists") || "{}");
  const userWishlist = allWishlists[firebaseUser.uid] || [];
  const products = getProducts();

  const enrichedWishlist = userWishlist
    .map((productId) => products.find((p) => p.id === productId))
    .filter((p) => p !== undefined);

  return { ok: true, wishlist: enrichedWishlist };
}

export async function toggleWishlistApi(productId) {
  await delay(100);
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error("Unauthorized");

  const allWishlists = JSON.parse(localStorage.getItem("stitchaura_wishlists") || "{}");
  let userWishlist = allWishlists[firebaseUser.uid] || [];

  if (userWishlist.includes(productId)) {
    userWishlist = userWishlist.filter((id) => id !== productId);
  } else {
    userWishlist.push(productId);
  }

  allWishlists[firebaseUser.uid] = userWishlist;
  localStorage.setItem("stitchaura_wishlists", JSON.stringify(allWishlists));

  return { ok: true, message: "Wishlist state toggled." };
}
