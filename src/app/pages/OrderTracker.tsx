import React, { useState } from "react";
import { Search, Package, Clock, CheckCircle2, Truck, Gift, MessageCircle, AlertCircle, ArrowLeft, Phone } from "lucide-react";
import { Page } from "../types";
import { fmt } from "../utils";

interface TrackedOrder {
  id: number;
  customer_name: string;
  delivery_zone: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  total_amount: number;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

const STEPS = [
  { key: "received", label: "Order Received", desc: "Order recorded & payment pending", icon: Clock },
  { key: "confirmed", label: "Bouquet Crafting", desc: "Artisans hand-twisting wire stems", icon: Gift },
  { key: "packed", label: "Wrapping & Quality", desc: "Satin ribbon & floral gift box packed", icon: Package },
  { key: "delivery", label: "Out for Delivery", desc: "Rider navigating Pokhara routes", icon: Truck },
  { key: "delivered", label: "Delivered", desc: "Enjoy your everlasting flowers!", icon: CheckCircle2 },
];

export default function OrderTracker({
  navigate,
}: {
  navigate: (p: Page) => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setError("Please enter your Order ID (e.g. 12) or 10-digit phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.[0] || "Could not find your order. Please check the details.");
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("Network error. Please ensure the server is running or contact us on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  // Determine which step is active based on order.status
  const getActiveStepIndex = (status: TrackedOrder["status"]) => {
    switch (status) {
      case "pending":
        return 0;
      case "confirmed":
        return 2;
      case "delivered":
        return 4;
      case "cancelled":
        return -1;
      default:
        return 1;
    }
  };

  const activeIndex = order ? getActiveStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-[#FFF8F3] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8A7A72] hover:text-[#D1748C] transition-colors mb-6"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <ArrowLeft size={14} /> Back to Shop
        </button>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#F5E8EE] text-[#D1748C] text-xs font-semibold px-3 py-1 rounded-full mb-2 uppercase tracking-wider">
            <Package size={12} /> Pokhara Delivery Tracker
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Track Your Flower Order
          </h1>
          <p className="text-xs sm:text-sm text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Enter your order ID (e.g. <strong>#4</strong>) or the 10-digit mobile number you used during checkout.
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleTrack} className="bg-white rounded-2xl p-3 sm:p-4 border border-[rgba(216,170,185,0.3)] shadow-sm flex flex-col sm:flex-row gap-2.5 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A7A72]" />
            <input
              type="text"
              placeholder="Enter Order ID or 10-digit Phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[rgba(216,170,185,0.3)] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#D1748C]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm hover:bg-[#D1748C] transition-all disabled:opacity-50"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {loading ? "Locating Order..." : "Track Status"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-600 flex items-center gap-2 mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details View */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[rgba(216,170,185,0.3)] shadow-md space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(216,170,185,0.2)] pb-4">
              <div>
                <p className="text-xs text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>Order Number</p>
                <p className="text-xl font-bold text-[#D1748C]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  #{order.id}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-600"
                      : "bg-[#F5E8EE] text-[#D1748C]"
                  }`}
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {order.status}
                </span>
                <p className="text-[11px] text-[#8A7A72] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {new Date(order.created_at).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Stepper Timeline */}
            {order.status !== "cancelled" ? (
              <div className="py-2">
                <p className="text-xs font-semibold text-[#4A4A4A] mb-6 uppercase tracking-wider text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Handcrafting & Delivery Progress
                </p>
                <div className="relative flex justify-between items-start">
                  {/* Background Line */}
                  <div className="absolute top-5 left-4 right-4 h-0.5 bg-[#F0E8E0] -z-0" />
                  <div
                    className="absolute top-5 left-4 h-0.5 bg-[#D1748C] transition-all duration-500 -z-0"
                    style={{ width: `${(Math.max(0, activeIndex) / (STEPS.length - 1)) * 95}%` }}
                  />

                  {STEPS.map((step, idx) => {
                    const isDone = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center max-w-[85px] z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                            isDone
                              ? "bg-[#D1748C] text-white ring-4 ring-[#F5E8EE]"
                              : "bg-white text-[#8A7A72] border-2 border-[#E0D8D0]"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <p
                          className={`text-[11px] font-semibold mt-2.5 leading-tight ${
                            isCurrent ? "text-[#D1748C]" : isDone ? "text-[#2B2B2B]" : "text-[#8A7A72]"
                          }`}
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-xs">
                This order was cancelled. Please contact us via WhatsApp if you have questions.
              </div>
            )}

            {/* Items Summary */}
            <div className="border-t border-[rgba(216,170,185,0.2)] pt-5">
              <h4 className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Items Ordered
              </h4>
              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs bg-[#FFF8F3] p-2.5 rounded-xl">
                    <span className="text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {item.product_name} <strong className="text-[#8A7A72]">× {item.quantity}</strong>
                    </span>
                    <span className="font-semibold text-[#D1748C]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {fmt(item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-2 text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <span>Total Amount (Cash on Delivery)</span>
                <span className="text-[#D1748C] text-base">{fmt(order.total_amount)}</span>
              </div>
            </div>

            {/* Help / WhatsApp */}
            <div className="bg-[#EDF4EE] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4F6F52]">
              <div>
                <p className="font-semibold">Need urgent delivery changes?</p>
                <p className="text-[11px] text-[#5A7D5E]">Our Rambazar team is available 9 AM - 8 PM daily.</p>
              </div>
              <a
                href={`https://wa.me/9779769695263?text=${encodeURIComponent(
                  `Hi Roselle! I am inquiring about Order #${order.id} for ${order.customer_name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-4 py-2 rounded-full font-medium hover:opacity-90 flex items-center gap-1.5 flex-shrink-0"
              >
                <MessageCircle size={14} /> WhatsApp Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
