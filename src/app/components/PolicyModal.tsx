import React from "react";
import { X, ShieldCheck, Truck, RotateCcw, HeartHandshake } from "lucide-react";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "privacy" | "terms" | "delivery";
}

export default function PolicyModal({ isOpen, onClose, type }: PolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 border border-[rgba(216,170,185,0.3)] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F5E8EE] text-[#2B2B2B] hover:text-[#D1748C] flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {type === "privacy" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#D1748C]">
              <ShieldCheck size={24} />
              <h2 className="text-xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Privacy Policy
              </h2>
            </div>
            <p className="text-xs text-[#6E635F] leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
              At Roselle, your personal data is sacred. We only collect the minimal details required to deliver your handcrafted flower bouquets:
            </p>
            <div className="space-y-2.5 text-xs text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <p>• <strong>Full Name & Phone:</strong> Used strictly by our Pokhara delivery riders to contact you upon arrival.</p>
              <p>• <strong>Delivery Address:</strong> Used exclusively to deliver your order.</p>
              <p>• <strong>Email:</strong> Used to send digital order receipts and confirmation updates.</p>
              <p>• <strong>No Data Selling:</strong> We never sell, rent, or distribute your private contact details to third parties.</p>
            </div>
          </div>
        )}

        {type === "delivery" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#4F6F52]">
              <Truck size={24} />
              <h2 className="text-xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Delivery Information (Pokhara)
              </h2>
            </div>
            <div className="space-y-3 text-xs text-[#5A5A5A]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <p>• <strong>Pokhara Valley:</strong> Complimentary or nominal standard delivery within Lakeside, Mahendrapool, Rambazar, Chipledhunga, and surrounding areas.</p>
              <p>• <strong>Payment Method:</strong> 100% Cash on Delivery (COD). Inspect your flowers before paying.</p>
              <p>• <strong>Delivery Time Slots:</strong> Morning (9 AM - 12 PM), Afternoon (12 PM - 4 PM), Evening (4 PM - 7 PM).</p>
              <p>• <strong>Outside Valley:</strong> Shipped via domestic courier services with confirmed pre-dispatch rates.</p>
            </div>
          </div>
        )}

        {type === "terms" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#D1748C]">
              <HeartHandshake size={24} />
              <h2 className="text-xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Terms & Flower Guarantee
              </h2>
            </div>
            <div className="space-y-3 text-xs text-[#5A5A5A]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <p>• <strong>100% Handcrafted:</strong> Every bloom is hand-shaped using premium chenille fuzzy-wire. Because each piece is handmade, slight artistic variations make every stem unique.</p>
              <p>• <strong>Everlasting Quality:</strong> Never needs water, will not wilt, and lasts for years if kept dry.</p>
              <p>• <strong>Care Instructions:</strong> Gently dust with a soft brush or hairdryer on cool setting.</p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 bg-[#1A1A1A] text-white py-2.5 rounded-full text-xs font-semibold hover:bg-[#D1748C] transition-colors"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
