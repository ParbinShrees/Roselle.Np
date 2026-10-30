import React from 'react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { CartItem } from '../types';
import { fmt } from '../utils';

interface CheckoutPageProps {
  cart: CartItem[];
  cartTotal: number;
  navigate: (page: string) => void;
  form: { name: string; phone: string; email: string; address: string; zone: "inside" | "outside"; note: string };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CheckoutPage({ cart, cartTotal, navigate, form, setForm, isSubmitting, setIsSubmitting }: CheckoutPageProps) {
  const isValidPhone = /^\d{10}$/.test(form.phone);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const isFormValid  = form.name.trim() !== "" && isValidPhone && isValidEmail && form.address.trim() !== "";

  const fieldClass = (valid: boolean, touched: boolean) =>
    `w-full border rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 text-sm transition-all ${
      touched && !valid
        ? "border-red-400 focus:border-red-400 focus:ring-red-100"
        : "border-[rgba(216,170,185,0.35)] focus:border-[#D1748C] focus:ring-[#E8A0B4]/20"
    }`;

  const phoneTouched   = form.phone.length > 0;
  const emailTouched   = form.email.length > 0;
  const nameTouched    = form.name.length > 0;
  const addressTouched = form.address.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        customer_name: form.name.trim(),
        phone:         form.phone.trim(),
        email:         form.email.trim(),
        address:       form.address.trim(),
        delivery_zone: form.zone,
        gift_message:  form.note.trim(),
        total_amount:  cartTotal,
        items: cart.map(i => ({
          product_name: i.name,
          quantity:     i.qty,
          unit_price:   i.price,
        })),
      };

      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.errors?.join(" ") || "Failed to place order. Please try again.";
        toast.error(msg);
        return;
      }

      toast.success("Order confirmed! 🌸");
      navigate("confirmation");

    } catch (err) {
      console.error("Order submission error:", err);
      toast.error("Could not reach the server. Make sure the backend is running, then try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <span className="text-xs font-semibold text-[#D1748C] tracking-widest uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Almost there</span>
        <h1 className="text-3xl font-bold text-[#2B2B2B] mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>Confirm Order</h1>
      </div>
      <div className="grid md:grid-cols-[1fr_340px] gap-8 items-start">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="bg-white border border-[rgba(216,170,185,0.25)] rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>Delivery Details</h2>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#2B2B2B] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Full Name *</label>
              <input id="name" type="text" required placeholder="Your name" value={form.name}
                onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
                aria-required="true"
                className={fieldClass(form.name.trim() !== "", nameTouched)}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
              {nameTouched && form.name.trim() === "" && (
                <p className="text-xs text-red-500 mt-1" role="alert">Full name is required.</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#2B2B2B] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Phone Number *</label>
              <input id="phone" type="tel" required placeholder="98XXXXXXXX" value={form.phone}
                onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                maxLength={10} inputMode="numeric" aria-required="true" aria-describedby="phone-error"
                className={fieldClass(isValidPhone, phoneTouched)}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
              {phoneTouched && !isValidPhone && (
                <p id="phone-error" className="text-xs text-red-500 mt-1" role="alert">Enter a valid 10-digit Nepali number (e.g. 9841234567).</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2B2B2B] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Email Address *</label>
              <input id="email" type="email" required placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm((f: any) => ({ ...f, email: e.target.value }))}
                aria-required="true" aria-describedby="email-error"
                className={fieldClass(isValidEmail, emailTouched)}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
              {emailTouched && !isValidEmail && (
                <p id="email-error" className="text-xs text-red-500 mt-1" role="alert">Enter a valid email address.</p>
              )}
            </div>

            {/* Delivery Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-[#2B2B2B] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Delivery Address *</label>
              <textarea id="address" required placeholder="House 12, Ward No. 4, Nayagaun, Pokhara" value={form.address} rows={2}
                onChange={(e) => setForm((f: any) => ({ ...f, address: e.target.value }))}
                aria-required="true" aria-describedby="address-error"
                className={`${fieldClass(form.address.trim() !== "", addressTouched)} resize-none`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
              {addressTouched && form.address.trim() === "" && (
                <p id="address-error" className="text-xs text-red-500 mt-1" role="alert">Delivery address is required.</p>
              )}
            </div>
          </div>

          {/* Delivery Zone */}
          <div className="bg-white border border-[rgba(216,170,185,0.25)] rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>Delivery Zone *</h2>
            {[
              { v: "inside",  l: "Inside Pokhara Valley",  s: "Cash on Delivery" },
              { v: "outside", l: "Outside Pokhara Valley", s: "Delivery cost confirmed by us based on route" },
            ].map(({ v, l, s }) => (
              <label key={v} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${form.zone === v ? "border-[#D1748C] bg-[#FFF8F3]" : "border-[rgba(216,170,185,0.3)] bg-white hover:border-[#E8A0B4]"}`}>
                <input type="radio" name="zone" value={v} checked={form.zone === v} onChange={() => setForm((f: any) => ({ ...f, zone: v }))} className="mt-0.5 accent-[#D1748C]" />
                <div>
                  <p className="text-sm font-medium text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{l}</p>
                  <p className="text-xs text-[#8A7A72] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>{s}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Gift Message */}
          <div className="bg-white border border-[rgba(216,170,185,0.25)] rounded-2xl p-5">
            <label htmlFor="gift-note" className="block text-sm font-medium text-[#2B2B2B] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Gift Message (optional)</label>
            <textarea id="gift-note" rows={3} placeholder="Add a personal note or special delivery instructions…" value={form.note}
              onChange={(e) => setForm((f: any) => ({ ...f, note: e.target.value }))}
              className="w-full border border-[rgba(216,170,185,0.35)] rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-[#D1748C] focus:ring-2 focus:ring-[#E8A0B4]/20 text-sm resize-none transition-all"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            />
          </div>

          {/* Scheduled Delivery Slot */}
          <div className="bg-white border border-[rgba(216,170,185,0.25)] rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Preferred Delivery Time (Pokhara)
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "morning", label: "Morning", time: "9 AM - 12 PM" },
                { id: "afternoon", label: "Afternoon", time: "12 PM - 4 PM" },
                { id: "evening", label: "Evening", time: "4 PM - 7 PM" },
              ].map((slot) => {
                const isSelected = (form.slot || "morning") === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setForm((f: any) => ({ ...f, slot: slot.id }))}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-[#D1748C] bg-[#FFF8F3] text-[#D1748C] font-semibold ring-1 ring-[#D1748C]"
                        : "border-[rgba(216,170,185,0.3)] bg-white text-[#6E635F]"
                    }`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <p className="text-xs">{slot.label}</p>
                    <p className="text-[10px] text-[#8A7A72]">{slot.time}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={!isFormValid || isSubmitting}
            className="w-full bg-[#1A1A1A] text-[#FFF8F3] py-3.5 rounded-full font-semibold hover:bg-[#D1748C] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Poppins', sans-serif" }}>
            {isSubmitting ? (
              <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Confirming…</>
            ) : (
              <>Confirm Order <ArrowRight size={15} /></>
            )}
          </button>

          {!isFormValid && (form.name || form.phone || form.email || form.address) && (
            <p className="text-center text-xs text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Please fill in all required fields correctly to continue.
            </p>
          )}
        </form>

        {/* Order Summary */}
        <div className="bg-white border border-[rgba(216,170,185,0.25)] rounded-2xl p-5 sticky top-20 space-y-4">
          <h2 className="font-semibold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>Order Summary</h2>
          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 pb-2 border-b border-[rgba(216,170,185,0.15)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#F5E8EE]">
                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#2B2B2B] truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.name}</p>
                    <p className="text-[10px] text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>×{item.qty}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#D1748C] flex-shrink-0" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(item.price * item.qty)}</span>
                </div>
                {item.customDetails && (
                  <div className="text-[10px] text-[#8A7A72] bg-[#FFF8F3] p-1.5 rounded-lg leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    <p className="font-medium text-[#D1748C]">• {item.customDetails.stemsSummary}</p>
                    {item.customDetails.wrapping && <p>• Wrap: {item.customDetails.wrapping}</p>}
                    {item.customDetails.ribbon && <p>• Ribbon: {item.customDetails.ribbon}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-[rgba(216,170,185,0.2)] pt-3 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-sm text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>Subtotal</span>
              <span className="text-sm font-bold text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>Delivery</span>
              <span className="text-sm text-[#4F6F52] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {form.zone === "outside" ? "Rs. 150 (Outside valley)" : "Free (Inside Pokhara)"}
              </span>
            </div>
            <div className="flex justify-between border-t border-[rgba(216,170,185,0.2)] pt-2 text-base font-bold text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <span>Total Payable</span>
              <span className="text-[#D1748C]">{fmt(cartTotal + (form.zone === "outside" ? 150 : 0))}</span>
            </div>
            <p className="text-[10px] text-[#8A7A72] text-center pt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
              💵 Cash on Delivery upon receiving your flowers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

