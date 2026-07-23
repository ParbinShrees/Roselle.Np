import React from 'react';
import { Check, MessageCircle } from 'lucide-react';
import { CartItem } from '../types';
import { fmt } from '../utils';

interface ConfirmationPageProps {
  cart: CartItem[];
  cartTotal: number;
  navigate: (page: string) => void;
  setCart: (cart: CartItem[]) => void;
  form: { name: string; phone: string; address: string; };
}

export default function ConfirmationPage({ cart, cartTotal, navigate, setCart, form }: ConfirmationPageProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-[#EDF4EE] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={32} className="text-[#4F6F52]" />
        </div>
        <h1 className="text-3xl font-bold text-[#2B2B2B] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Thank You!</h1>
        <p className="text-[#5A5A5A] mb-2 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Your order is placed. We'll call <strong className="text-[#2B2B2B]">{form.phone || "you"}</strong> to confirm your order and delivery cost.
        </p>
        <p className="text-sm text-[#8A7A72] mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>Roselle · Rambazar, Pokhara · 9769695263</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              const msg = `Hi Roselle! I just placed an order.\n\nItems: ${cart.map((i) => `${i.name} ×${i.qty}`).join(", ")}\nTotal: ${fmt(cartTotal)}\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}`;
              window.open(`https://wa.me/9779769695263?text=${encodeURIComponent(msg)}`);
            }}
            className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-green-100"
            style={{ fontFamily: "'Poppins', sans-serif" }}>
            <MessageCircle size={15} /> Confirm via WhatsApp
          </button>
          <button onClick={() => { setCart([]); navigate("home"); }}
            className="border border-[#2B2B2B] text-[#2B2B2B] px-6 py-3 rounded-full font-medium hover:bg-[#2B2B2B] hover:text-white transition-all"
            style={{ fontFamily: "'Poppins', sans-serif" }}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
