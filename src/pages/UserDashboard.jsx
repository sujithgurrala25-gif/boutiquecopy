import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  Heart,
  LogOut,
  Package,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  UserRound,
} from "lucide-react";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { formatPrice } from "../utils/pricing.js";
import {
  addToCartApi,
  fetchCart,
  fetchOrders,
  fetchProducts,
  fetchWishlist,
  removeFromCartApi,
  toggleWishlistApi,
} from "../utils/api.js";

const tabs = [
  { id: "browse",   label: "Browse Products",  icon: ShoppingBag },
  { id: "details",  label: "Product Details",   icon: Eye },
  { id: "cart",     label: "Cart",              icon: ShoppingCart },
  { id: "wishlist", label: "Wishlist",          icon: Heart },
  { id: "orders",   label: "My Orders",         icon: Package },
  { id: "profile",  label: "Profile",           icon: UserRound },
];

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts]     = useState([]);
  const [cart, setCart]             = useState([]);
  const [wishlist, setWishlist]     = useState([]);
  const [orders, setOrders]         = useState([]);
  const [activeTab, setActiveTab]   = useState("browse");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [prodData, cartData, wishData, ordData] = await Promise.all([
          fetchProducts(),
          fetchCart(),
          fetchWishlist(),
          fetchOrders(),
        ]);
        setProducts(prodData.products || []);
        setCart(cartData.cart || []);
        setWishlist(wishData.wishlist || []);
        setOrders(ordData.orders || []);
        setSelectedProduct((prodData.products || [])[0] || null);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleViewDetails(product) {
    setSelectedProduct(product);
    setActiveTab("details");
  }

  async function handleAddToCart(product) {
    try {
      const data = await addToCartApi(product.id);
      setCart(data.cart || []);
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  }

  async function handleRemoveFromCart(productId) {
    try {
      const data = await removeFromCartApi(productId);
      setCart(data.cart || []);
    } catch (err) {
      console.error("Remove from cart error:", err);
    }
  }

  async function handleWishlist(product) {
    try {
      const data = await toggleWishlistApi(product.id);
      setWishlist(data.wishlist || []);
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  }

  function isInCart(productId) {
    return cart.some((item) => item.id === productId);
  }

  function isInWishlist(productId) {
    return wishlist.some((item) => item.id === productId);
  }

  if (loading) {
    return (
      <section className="page-shell flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner label="Loading dashboard" />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mb-8 grid gap-5 rounded-lg bg-white p-5 shadow-aura lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">User Dashboard</p>
          <h1 className="section-title">Welcome, {user.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
            Browse boutique products, save favorites, manage your cart, and track custom stitching orders.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/select-outfit" className="btn-primary">
            <Sparkles size={17} />
            Start Designing
          </Link>
          <button type="button" onClick={handleLogout} className="btn-secondary">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-bold transition ${
                activeTab === tab.id ? "bg-plum text-white shadow-aura" : "bg-white text-plum shadow-sm hover:bg-lavender/60"
              }`}
            >
              <Icon size={17} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "browse" && (
        <DashboardPanel title="Browse Boutique Products">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inCart={isInCart(product.id)}
                inWishlist={isInWishlist(product.id)}
                onDetails={handleViewDetails}
                onCart={handleAddToCart}
                onWishlist={handleWishlist}
              />
            ))}
          </div>
        </DashboardPanel>
      )}

      {activeTab === "details" && (
        <DashboardPanel title="View Product Details">
          {selectedProduct ? (
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <img src={selectedProduct.image || selectedProduct.image_url} alt={selectedProduct.name} className="h-full min-h-[360px] w-full rounded-lg object-cover shadow-aura" />
              <div className="card p-6">
                <p className="mb-3 text-sm font-bold uppercase text-gold">{selectedProduct.category}</p>
                <h2 className="font-display text-4xl font-bold text-plum">{selectedProduct.name}</h2>
                <p className="mt-4 leading-7 text-ink/70">{selectedProduct.description}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Info label="Price" value={formatPrice(selectedProduct.price)} />
                  <Info label="Stock" value={selectedProduct.stock} />
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={() => handleAddToCart(selectedProduct)} className="btn-primary flex-1">
                    <ShoppingCart size={17} />
                    {isInCart(selectedProduct.id) ? "Added to Cart" : "Add to Cart"}
                  </button>
                  <button type="button" onClick={() => handleWishlist(selectedProduct)} className="btn-secondary flex-1">
                    <Heart size={17} fill={isInWishlist(selectedProduct.id) ? "currentColor" : "none"} />
                    {isInWishlist(selectedProduct.id) ? "Saved" : "Wishlist"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="No product selected" message="Choose a product first to view details." />
          )}
        </DashboardPanel>
      )}

      {activeTab === "cart" && (
        <DashboardPanel title="Add To Cart">
          {cart.length ? (
            <ItemGrid
              items={cart}
              actionLabel="Remove"
              onAction={(product) => handleRemoveFromCart(product.id)}
            />
          ) : (
            <EmptyState title="Cart is empty" message="Products you add to cart will appear here." actionLabel="Browse Products" actionTo="/user-dashboard" />
          )}
        </DashboardPanel>
      )}

      {activeTab === "wishlist" && (
        <DashboardPanel title="Wishlist">
          {wishlist.length ? (
            <ItemGrid items={wishlist} actionLabel="Remove Wishlist" onAction={(product) => handleWishlist(product)} />
          ) : (
            <EmptyState title="Wishlist is empty" message="Save favorite boutique products to view them later." />
          )}
        </DashboardPanel>
      )}

      {activeTab === "orders" && (
        <DashboardPanel title="My Orders">
          {orders.length ? (
            <div className="grid gap-4">
              {orders.map((order) => (
                <article key={order.id} className="card grid gap-4 overflow-hidden p-5 md:grid-cols-[140px_1fr_auto] md:items-center">
                  <img src={order.fabric_image || order.fabricImage} alt="Fabric" className="h-32 w-full rounded-lg object-cover" />
                  <div>
                    <p className="text-xs font-bold uppercase text-gold">{order.id}</p>
                    <h3 className="font-display text-2xl font-bold text-plum">{order.outfit?.title || order.outfit_type}</h3>
                    <p className="mt-1 text-sm text-ink/60">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="rounded-md bg-lavender px-3 py-2 text-sm font-bold text-plum">{order.status}</p>
                    <p className="mt-3 font-bold text-rose">{formatPrice(order.price)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No orders yet" message="Your confirmed stitching orders will appear here." actionLabel="Start Designing" actionTo="/select-outfit" />
          )}
        </DashboardPanel>
      )}

      {activeTab === "profile" && (
        <DashboardPanel title="Profile">
          <div className="card max-w-2xl p-6">
            <span className="mb-5 grid h-16 w-16 place-items-center rounded-md bg-lavender text-plum">
              <UserRound size={30} />
            </span>
            <div className="grid gap-3">
              <Info label="Name" value={user.name} />
              <Info label="Email" value={user.email} />
              <Info label="Role" value={user.role || "user"} />
              <Info label="Cart Items" value={cart.length} />
              <Info label="Wishlist Items" value={wishlist.length} />
              <Info label="Orders" value={orders.length} />
            </div>
          </div>
        </DashboardPanel>
      )}
    </section>
  );
}

function DashboardPanel({ title, children }) {
  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-3xl font-bold text-plum">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ProductCard({ product, inCart, inWishlist, onDetails, onCart, onWishlist }) {
  return (
    <article className="card group overflow-hidden">
      <img src={product.image || product.image_url} alt={product.name} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
      <div className="p-5">
        <p className="text-xs font-bold uppercase text-gold">{product.category}</p>
        <h3 className="mt-1 font-display text-2xl font-bold text-plum">{product.name}</h3>
        <p className="mt-2 text-sm leading-6 text-ink/65">{product.description}</p>
        <p className="mt-3 text-lg font-bold text-rose">{formatPrice(product.price)}</p>
        <div className="mt-5 grid gap-2">
          <button type="button" onClick={() => onDetails(product)} className="btn-secondary">
            <Eye size={17} />
            View Product Details
          </button>
          <button type="button" onClick={() => onCart(product)} className="btn-primary">
            <ShoppingCart size={17} />
            {inCart ? "Added to Cart" : "Add to Cart"}
          </button>
          <button type="button" onClick={() => onWishlist(product)} className="btn-secondary">
            <Heart size={17} fill={inWishlist ? "currentColor" : "none"} />
            {inWishlist ? "Saved to Wishlist" : "Wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ItemGrid({ items, actionLabel, onAction }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.id} className="card overflow-hidden">
          <img src={item.image || item.image_url} alt={item.name} className="h-44 w-full object-cover" />
          <div className="p-5">
            <p className="text-xs font-bold uppercase text-gold">{item.category}</p>
            <h3 className="font-display text-xl font-bold text-plum">{item.name}</h3>
            <p className="mt-2 font-bold text-rose">{formatPrice(item.price)}</p>
            <button type="button" onClick={() => onAction(item)} className="btn-secondary mt-4 w-full">
              {actionLabel}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md bg-cream px-4 py-3">
      <p className="text-xs font-bold uppercase text-gold">{label}</p>
      <p className="mt-1 font-bold text-plum">{value}</p>
    </div>
  );
}
