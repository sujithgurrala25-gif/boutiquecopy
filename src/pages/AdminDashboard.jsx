import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  LogOut,
  MessageSquareText,
  PackageCheck,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  Users,
} from "lucide-react";
import { boutiqueImages } from "../assets/images.js";
import { useAuth } from "../context/AuthContext.jsx";
import { orderStatusOptions } from "../utils/data.js";
import { formatPrice } from "../utils/pricing.js";
import {
  addProduct,
  deleteProduct,
  getFeedback,
  getOrders,
  getProducts,
  getUsers,
  updateOrderStatus,
  updateProduct,
} from "../utils/storage.js";

const emptyProductForm = {
  name: "",
  category: "Blouse",
  price: "",
  stock: "",
  image: "",
  description: "",
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => getProducts());
  const [orders, setOrders] = useState(() => getOrders());
  const [feedback] = useState(() => getFeedback());
  const [customers] = useState(() => getUsers().filter((user) => (user.role || "user") === "user"));
  const [form, setForm] = useState(emptyProductForm);
  const [editingId, setEditingId] = useState("");

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function handleFormChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function resetForm() {
    setForm(emptyProductForm);
    setEditingId("");
  }

  function handleProductSubmit(event) {
    event.preventDefault();
    const productData = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      image: form.image || boutiqueImages.intro,
    };

    if (editingId) {
      setProducts(updateProduct(editingId, productData));
    } else {
      setProducts(addProduct(productData));
    }

    resetForm();
  }

  function handleEditProduct(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      image: product.image,
      description: product.description,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteProduct(productId) {
    setProducts(deleteProduct(productId));
    if (editingId === productId) resetForm();
  }

  function handleStatusChange(orderId, status) {
    setOrders(updateOrderStatus(orderId, status));
  }

  return (
    <section className="page-shell">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-gold">Admin Dashboard</p>
          <h1 className="section-title">Boutique management panel</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/65">
            Manage products, monitor orders, update stitching status, and review customer activity.
          </p>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary">
          <LogOut size={17} />
          Logout
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard icon={PackageCheck} label="Products" value={products.length} />
        <StatCard icon={ShoppingBag} label="Orders" value={orders.length} />
        <StatCard icon={Users} label="Customers" value={customers.length} />
        <StatCard icon={MessageSquareText} label="Feedback" value={feedback.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form className="card h-fit p-5" onSubmit={handleProductSubmit}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-gold">{editingId ? "Edit product" : "Add product"}</p>
              <h2 className="font-display text-2xl font-bold text-plum">Product Form</h2>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-md bg-lavender text-plum">
              {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
            </span>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-plum">
              Product Name
              <input className="input-field" name="name" value={form.name} onChange={handleFormChange} required />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-plum">
                Category
                <select className="input-field" name="category" value={form.category} onChange={handleFormChange}>
                  {["Blouse", "Kurti", "Long Frock", "Lehenga"].map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-plum">
                Stock
                <input className="input-field" type="number" min="0" name="stock" value={form.stock} onChange={handleFormChange} required />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-bold text-plum">
              Price
              <input className="input-field" type="number" min="1" name="price" value={form.price} onChange={handleFormChange} required />
            </label>

            <label className="grid gap-2 text-sm font-bold text-plum">
              Image URL
              <input className="input-field" name="image" value={form.image} onChange={handleFormChange} placeholder="https://..." />
            </label>

            <label className="grid gap-2 text-sm font-bold text-plum">
              Description
              <textarea className="input-field min-h-28 resize-y" name="description" value={form.description} onChange={handleFormChange} required />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="btn-primary flex-1">
                <Save size={17} />
                {editingId ? "Update Product" : "Add Product"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="card overflow-hidden">
          <div className="border-b border-plum/10 p-5">
            <h2 className="font-display text-2xl font-bold text-plum">View All Products</h2>
          </div>
          {products.length ? (
            <div className="divide-y divide-plum/10">
              {products.map((product) => (
                <article key={product.id} className="grid gap-4 p-5 md:grid-cols-[130px_1fr]">
                  <img src={product.image || boutiqueImages.intro} alt={product.name} className="h-32 w-full rounded-lg object-cover" />
                  <div>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <p className="text-xs font-bold uppercase text-gold">{product.category}</p>
                        <h3 className="font-display text-2xl font-bold text-plum">{product.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-ink/65">{product.description}</p>
                      </div>
                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-lg font-bold text-rose">{formatPrice(product.price)}</p>
                        <p className="text-xs font-bold uppercase text-ink/50">Stock: {product.stock}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={() => handleEditProduct(product)} className="btn-secondary flex-1">
                        <Edit3 size={17} />
                        Edit Product
                      </button>
                      <button type="button" onClick={() => handleDeleteProduct(product.id)} className="btn-secondary flex-1">
                        <Trash2 size={17} />
                        Delete Product
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-ink/60">No products available. Add your first product.</div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="card overflow-hidden">
          <div className="border-b border-plum/10 p-5">
            <h2 className="font-display text-2xl font-bold text-plum">View All Orders</h2>
          </div>
          {orders.length ? (
            <div className="divide-y divide-plum/10">
              {orders.map((order) => (
                <article key={order.id} className="grid gap-4 p-5 lg:grid-cols-[140px_1fr]">
                  <img src={order.fabricImage} alt="Uploaded fabric" className="h-36 w-full rounded-lg object-cover" />
                  <div>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <p className="text-xs font-bold uppercase text-gold">{order.id}</p>
                        <h3 className="font-display text-2xl font-bold text-plum">{order.outfit.title}</h3>
                        <p className="text-sm text-ink/58">
                          {order.customerName} · {order.customerEmail}
                        </p>
                      </div>
                      <label className="grid gap-2 text-sm font-bold text-plum">
                        Update Order Status
                        <select className="input-field max-w-56" value={order.status} onChange={(event) => handleStatusChange(order.id, event.target.value)}>
                          {orderStatusOptions.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <Info label="Price" value={formatPrice(order.price)} />
                      <Info label="Neck" value={order.customization.neckStyle} />
                      <Info label="Sleeve" value={order.customization.sleeveStyle} />
                      <Info label="Fitting" value={order.customization.fittingStyle} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-ink/60">No customer orders yet.</div>
          )}
        </div>

        <div className="grid gap-6">
          <div className="card p-5">
            <h2 className="font-display text-2xl font-bold text-plum">View Customers</h2>
            <div className="mt-4 grid gap-3">
              {customers.length ? (
                customers.map((customer) => (
                  <article key={customer.id} className="rounded-lg bg-cream p-4">
                    <p className="font-bold text-plum">{customer.name}</p>
                    <p className="text-sm text-ink/60">{customer.email}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-ink/60">No customers yet.</p>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-2xl font-bold text-plum">Recent Feedback</h2>
            <div className="mt-4 grid gap-3">
              {feedback.length ? (
                feedback.map((item) => (
                  <article key={item.id} className="rounded-lg bg-cream p-4">
                    <p className="font-bold text-plum">{item.name}</p>
                    <p className="text-xs font-bold uppercase text-gold">
                      {item.rating}/5 · {item.outfitType}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink/68">{item.message}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-ink/60">No feedback yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="grid h-12 w-12 place-items-center rounded-md bg-lavender text-plum">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink/60">{label}</p>
        <p className="font-display text-3xl font-bold text-plum">{value}</p>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <span className="rounded-md bg-white px-3 py-2 text-xs font-bold text-plum">
      {label}: {value}
    </span>
  );
}
