import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Download, MessageCircle } from "lucide-react";
import DressPreview from "../components/DressPreview.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { buildOrderSummary, downloadTextFile } from "../utils/download.js";
import { estimatePrice, formatPrice } from "../utils/pricing.js";
import { addOrder, clearDraft, createId, getDraft } from "../utils/storage.js";

export default function PlaceOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const draft = useMemo(() => getDraft(user.id), [user.id]);
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const price = estimatePrice(draft.selectedOutfit?.id, draft.customization);
  const orderDate = new Date();

  if (!draft.selectedOutfit || !draft.measurements || !draft.customization) {
    return (
      <section className="page-shell">
        <EmptyState
          title="Order details are incomplete"
          message="Complete the design flow before confirming your stitching order."
          actionLabel="Start Designing"
          actionTo="/select-outfit"
        />
      </section>
    );
  }

  const previewOrder = {
    id: "Draft",
    customerName: user.name,
    outfit: draft.selectedOutfit,
    fabricImage: draft.fabricImage,
    measurements: draft.measurements,
    unit: draft.unit,
    customization: draft.customization,
    price,
    status: "Order Received",
    createdAt: orderDate.toISOString(),
  };

  function handleDownloadMeasurements() {
    downloadTextFile("stitchaura-measurements.txt", buildOrderSummary(previewOrder));
  }

  function handleConfirm() {
    setLoading(true);
    setTimeout(() => {
      const order = {
        ...previewOrder,
        id: createId("SA").toUpperCase(),
        userId: user.id,
        customerEmail: user.email,
        createdAt: new Date().toISOString(),
      };
      addOrder(order);
      clearDraft(user.id);
      setSuccessOrder(order);
      setLoading(false);
    }, 700);
  }

  const whatsAppText = encodeURIComponent(
    `Hello StitchAura Boutique, I want to confirm a ${draft.selectedOutfit.title} stitching order. Estimated price: ${formatPrice(price)}.`
  );

  return (
    <section className="page-shell">
      <div className="mb-8">
        <p className="mb-3 text-sm font-bold uppercase text-gold">Place Order</p>
        <h1 className="section-title">Final order confirmation</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <DressPreview outfit={draft.selectedOutfit} fabricImage={draft.fabricImage} customization={draft.customization} compact />

        <div className="card p-5">
          <h2 className="font-display text-2xl font-bold text-plum">Order Details</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <Detail label="Outfit Type" value={draft.selectedOutfit.title} />
            <Detail label="Neck Style" value={draft.customization.neckStyle} />
            <Detail label="Sleeve Style" value={draft.customization.sleeveStyle} />
            <Detail label="Fitting Type" value={draft.customization.fittingStyle} />
            <Detail label="Extra Options" value={(draft.customization.extras || []).join(", ") || "None"} />
            <Detail label="Estimated Price" value={formatPrice(price)} />
            <Detail label="Order Date" value={orderDate.toLocaleDateString()} />
          </div>

          <div className="mt-5 rounded-lg bg-cream p-4">
            <p className="mb-3 text-sm font-bold text-plum">Measurements</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {Object.entries(draft.measurements).map(([key, value]) => (
                <span key={key} className="rounded-md bg-white px-3 py-2 text-xs font-bold text-plum">
                  {key}: {value} {draft.unit}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={handleConfirm} className="btn-primary" disabled={loading}>
              {loading ? <LoadingSpinner label="Confirming" /> : "Confirm Order"}
            </button>
            <button type="button" onClick={handleDownloadMeasurements} className="btn-secondary">
              <Download size={17} />
              Download Measurements
            </button>
            <a href={`https://wa.me/?text=${whatsAppText}`} target="_blank" rel="noreferrer" className="btn-secondary">
              <MessageCircle size={17} />
              WhatsApp Boutique
            </a>
          </div>
        </div>
      </div>

      {successOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-plum/45 px-4 backdrop-blur-sm">
          <div className="card max-w-md p-6 text-center">
            <CheckCircle2 className="mx-auto mb-4 text-gold" size={54} />
            <h2 className="font-display text-3xl font-bold text-plum">Order Confirmed</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">
              Your order ID is <span className="font-bold text-plum">{successOrder.id}</span>.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/order-output/${successOrder.id}`)}
              className="btn-primary mt-6 w-full"
            >
              View Final Output
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-cream px-4 py-3">
      <span className="font-semibold text-ink/60">{label}</span>
      <span className="text-right font-bold text-plum">{value}</span>
    </div>
  );
}
