import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { History } from "lucide-react";
import DressPreview from "../components/DressPreview.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { formatPrice } from "../utils/pricing.js";
import { fetchOrderById } from "../utils/api.js";

export default function OrderOutput() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchOrderById(orderId);
        setOrder(data.order);
      } catch (err) {
        setError(err.message || "Order not found.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  if (loading) {
    return (
      <section className="page-shell flex items-center justify-center min-h-[40vh]">
        <LoadingSpinner label="Loading order" />
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="page-shell">
        <EmptyState
          title="Order not found"
          message="The selected order could not be found."
          actionLabel="Previous Orders"
          actionTo="/previous-orders"
        />
      </section>
    );
  }

  return (
    <section className="page-shell">
      <div className="mb-8">
        <p className="mb-3 text-sm font-bold uppercase text-gold">Final Order Output</p>
        <h1 className="section-title">Order {order.id}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <DressPreview outfit={order.outfit} fabricImage={order.fabric_image} customization={order.customization} />

        <div className="grid gap-5">
          <div className="card p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h2 className="font-display text-2xl font-bold text-plum">{order.outfit?.title || order.outfit_type}</h2>
                <p className="mt-1 text-sm text-ink/58">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className="rounded-md bg-gold/15 px-4 py-2 text-sm font-bold text-plum">{order.status}</span>
            </div>

            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Customer Number" value={order.customer_phone || "N/A"} />
              <Info label="Neck Style" value={order.customization?.neckStyle || "N/A"} />
              <Info label="Sleeve Style" value={order.customization?.sleeveStyle || "N/A"} />
              <Info label="Fitting Type" value={order.customization?.fittingStyle || "N/A"} />
              <Info label="Estimated Price" value={formatPrice(order.price)} />
              <Info label="Extra Options" value={(order.customization?.extras || []).join(", ") || "None"} />
              <Info label="Order Status" value={order.status} />
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-2xl font-bold text-plum">Measurement Summary</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {Object.entries(order.measurements || {}).map(([key, value]) => (
                <span key={key} className="rounded-md bg-cream px-3 py-2 text-xs font-bold text-plum">
                  {key}: {value} {order.unit}
                </span>
              ))}
            </div>
          </div>

          {order.fabric_image && (
            <div className="card overflow-hidden">
              <img src={order.fabric_image} alt="Uploaded fabric" className="h-56 w-full object-cover" />
            </div>
          )}

          <div className="mt-4">
            <Link to="/previous-orders" className="btn-primary w-full">
              <History size={17} />
              Go to Previous Orders
            </Link>
          </div>
        </div>
      </div>
    </section>
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
