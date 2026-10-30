import React, { useState } from "react";
import { Sparkles, Plus, Minus, Check, Heart, ShoppingBag, ArrowRight, MessageCircle, Gift, Layers, Palette, FileText } from "lucide-react";
import { Product, CartItem, Page } from "../types";
import { fmt } from "../utils";
import mixedPastelImg from "@/imports/pipe_cleaners_bouquet.jpg";
import pinkTulipImg from "@/imports/Pipecleaner_flower_bouquet___.jpg";
import sunflowerImg from "@/imports/Solei_Sunflower.jpg";
import blueDaisyImg from "@/imports/download__2_.jpg";
import pinkLilyImg from "@/imports/download.jpg";

interface StemOption {
  id: string;
  name: string;
  flowerType: string;
  color: string;
  pricePerStem: number;
  image: string;
  tag: string;
}

const STEM_OPTIONS: StemOption[] = [
  { id: "rose", name: "Velvet Rose", flowerType: "Rose", color: "Blush Pink", pricePerStem: 160, image: mixedPastelImg, tag: "Romantic" },
  { id: "tulip", name: "French Tulip", flowerType: "Tulip", color: "Coral Rose", pricePerStem: 170, image: pinkTulipImg, tag: "Popular" },
  { id: "sunflower", name: "Soleil Sunflower", flowerType: "Sunflower", color: "Golden Yellow", pricePerStem: 190, image: sunflowerImg, tag: "Bright" },
  { id: "daisy", name: "Morning Daisy", flowerType: "Daisy", color: "Sky Blue", pricePerStem: 150, image: blueDaisyImg, tag: "Gentle" },
  { id: "lily", name: "Princess Lily", flowerType: "Lily", color: "Pastel Lavender", pricePerStem: 200, image: pinkLilyImg, tag: "Elegant" },
];

const WRAPPING_OPTIONS = [
  { id: "frosted", name: "Korean Frosted White", price: 120, desc: "Semi-translucent matte finish with crisp folds" },
  { id: "kraft", name: "Vintage Kraft Paper", price: 100, desc: "Earthy rustic brown craft aesthetic" },
  { id: "blush", name: "Blush Rose Pearlescent", price: 140, desc: "Gentle shimmer paper in signature Roselle pink" },
  { id: "midnight", name: "Midnight Black Luxury", price: 140, desc: "High contrast dark wrap for vibrant blooms" },
];

const RIBBON_OPTIONS = [
  { id: "gold", name: "Champagne Gold Silk", colorHex: "#D4AF37" },
  { id: "rose", name: "Dusty Rose Velvet", colorHex: "#D1748C" },
  { id: "burgundy", name: "Deep Burgundy", colorHex: "#722F37" },
  { id: "emerald", name: "Forest Emerald", colorHex: "#2D5A27" },
  { id: "cream", name: "Vanilla Cream Satin", colorHex: "#FDFBF7" },
];

const CARD_THEMES = [
  { id: "birthday", name: "🎂 Birthday Wishes" },
  { id: "anniversary", name: "💍 Happy Anniversary" },
  { id: "love", name: "💖 With All My Love" },
  { id: "congrats", name: "🎓 Congratulations" },
  { id: "blank", name: "✉️ Custom Message" },
];

const ADDONS = [
  { id: "led", name: "Warm Fairy LED String Lights", price: 150, icon: "✨" },
  { id: "scent", name: "Sweet Rose Floral Scent Mist", price: 100, icon: "🌸" },
  { id: "bag", name: "Clear Presentation Gift Bag & Ribbon", price: 120, icon: "🛍️" },
  { id: "choco", name: "Artisanal Chocolate Box (3 pcs)", price: 280, icon: "🍫" },
];

export default function CustomBouquetBuilder({
  onAddToCart,
  navigate,
}: {
  onAddToCart: (item: CartItem) => void;
  navigate: (p: Page) => void;
}) {
  // Stems count per flower
  const [stemCounts, setStemCounts] = useState<Record<string, number>>({
    tulip: 3,
    rose: 2,
    sunflower: 1,
    daisy: 0,
    lily: 0,
  });

  const [selectedWrap, setSelectedWrap] = useState("frosted");
  const [selectedRibbon, setSelectedRibbon] = useState("rose");
  const [ribbonText, setRibbonText] = useState("");
  const [selectedCard, setSelectedCard] = useState("birthday");
  const [cardMessage, setCardMessage] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["led"]);

  const totalStems = Object.values(stemCounts).reduce((a, b) => a + b, 0);

  const updateStem = (id: string, delta: number) => {
    setStemCounts((prev) => {
      const cur = prev[id] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [id]: next };
    });
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Calculations
  const stemsCost = STEM_OPTIONS.reduce((sum, stem) => {
    return sum + (stemCounts[stem.id] || 0) * stem.pricePerStem;
  }, 0);

  const wrapCost = WRAPPING_OPTIONS.find((w) => w.id === selectedWrap)?.price || 120;
  const addonsCost = selectedAddons.reduce((sum, addonId) => {
    const addon = ADDONS.find((a) => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const totalCost = stemsCost + wrapCost + addonsCost;

  const handleAddCustomToCart = () => {
    if (totalStems < 3) {
      alert("Please select at least 3 flower stems to build a custom bouquet.");
      return;
    }

    const stemsSummary = STEM_OPTIONS.filter((s) => stemCounts[s.id] > 0)
      .map((s) => `${s.name} × ${stemCounts[s.id]}`)
      .join(", ");

    const wrapName = WRAPPING_OPTIONS.find((w) => w.id === selectedWrap)?.name || "Standard";
    const ribbonName = RIBBON_OPTIONS.find((r) => r.id === selectedRibbon)?.name || "Rose";
    const addonNames = selectedAddons.map((id) => ADDONS.find((a) => a.id === id)?.name || id);

    const customProduct: Product = {
      id: Date.now(),
      name: `Custom Bouquet (${totalStems} Stems)`,
      price: totalCost,
      image: pinkTulipImg,
      color: "Custom",
      flowerType: "Custom Mix",
      occasions: [selectedCard],
      isNewArrival: false,
      description: `Bespoke handcrafted bouquet. Includes: ${stemsSummary}. Wrap: ${wrapName}. Ribbon: ${ribbonName}.`,
      stock: true,
      badge: "Custom Made",
      trend: "stable",
      trendPct: 0,
      category: "bouquet",
      rating: 5.0,
      reviews: 1,
    };

    const cartItem: CartItem = {
      ...customProduct,
      qty: 1,
      customDetails: {
        stemsSummary,
        wrapping: wrapName,
        ribbon: ribbonName + (ribbonText ? ` ("${ribbonText}")` : ""),
        cardMessage: cardMessage ? `[${selectedCard}] ${cardMessage}` : undefined,
        addons: addonNames,
      },
    };

    onAddToCart(cartItem);
    navigate("checkout");
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-[#F5E8EE] text-[#D1748C] text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
            <Sparkles size={12} /> Roselle Atelier
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2B2B2B] leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Design Your Own Bouquet
          </h1>
          <p className="text-sm sm:text-base text-[#6E635F]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Handpick your flower stems, paper wrapping, ribbons, and personalized cards. Handcrafted petal by petal in Rambazar, Pokhara.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Step 1: Stems */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[rgba(216,170,185,0.3)] shadow-sm">
              <div className="flex items-center justify-between mb-5 border-b border-[rgba(216,170,185,0.2)] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <h2 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Select Flower Stems
                  </h2>
                </div>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#EDF4EE] text-[#4F6F52]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {totalStems} stems chosen (Min. 3)
                </span>
              </div>

              <div className="space-y-3.5">
                {STEM_OPTIONS.map((stem) => {
                  const count = stemCounts[stem.id] || 0;
                  return (
                    <div
                      key={stem.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        count > 0 ? "border-[#D1748C] bg-[#FFF8F3]" : "border-[rgba(216,170,185,0.25)] bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img src={stem.image} alt={stem.name} className="w-14 h-14 rounded-xl object-cover border border-[rgba(216,170,185,0.3)]" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {stem.name}
                            </h3>
                            <span className="text-[10px] text-[#D1748C] bg-[#F5E8EE] px-2 py-0.5 rounded-full font-medium">
                              {stem.tag}
                            </span>
                          </div>
                          <p className="text-xs text-[#8A7A72] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {stem.color} · <strong className="text-[#D1748C]">{fmt(stem.pricePerStem)}</strong> / stem
                          </p>
                        </div>
                      </div>

                      {/* Counter */}
                      <div className="flex items-center gap-2.5 bg-white border border-[rgba(216,170,185,0.4)] rounded-full px-3 py-1.5 shadow-xs">
                        <button
                          onClick={() => updateStem(stem.id, -1)}
                          disabled={count === 0}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[#2B2B2B] hover:text-[#D1748C] disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label={`Decrease ${stem.name}`}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-5 text-center font-bold text-xs tabular-nums" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {count}
                        </span>
                        <button
                          onClick={() => updateStem(stem.id, 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[#2B2B2B] hover:text-[#D1748C]"
                          aria-label={`Increase ${stem.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Wrapping Paper */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[rgba(216,170,185,0.3)] shadow-sm">
              <div className="flex items-center gap-2.5 mb-5 border-b border-[rgba(216,170,185,0.2)] pb-4">
                <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold">2</span>
                <h2 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Wrapping Paper Style
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {WRAPPING_OPTIONS.map((wrap) => {
                  const isSelected = selectedWrap === wrap.id;
                  return (
                    <div
                      key={wrap.id}
                      onClick={() => setSelectedWrap(wrap.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#D1748C] bg-[#FFF8F3] ring-2 ring-[#E8A0B4]/30"
                          : "border-[rgba(216,170,185,0.25)] hover:border-[#D1748C]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {wrap.name}
                        </span>
                        <span className="text-[11px] font-bold text-[#D1748C]">{fmt(wrap.price)}</span>
                      </div>
                      <p className="text-[11px] text-[#8A7A72] leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {wrap.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Step 3: Ribbon & Custom Message */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[rgba(216,170,185,0.3)] shadow-sm">
              <div className="flex items-center gap-2.5 mb-5 border-b border-[rgba(216,170,185,0.2)] pb-4">
                <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold">3</span>
                <h2 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Ribbon & Greeting Card
                </h2>
              </div>

              {/* Ribbon Colors */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#4A4A4A] mb-2 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Select Satin Ribbon (Included Free)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {RIBBON_OPTIONS.map((ribbon) => {
                    const isSelected = selectedRibbon === ribbon.id;
                    return (
                      <button
                        key={ribbon.id}
                        onClick={() => setSelectedRibbon(ribbon.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          isSelected ? "border-[#D1748C] bg-[#F5E8EE] text-[#2B2B2B]" : "border-[rgba(216,170,185,0.3)] bg-white text-[#6E635F]"
                        }`}
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: ribbon.colorHex }} />
                        {ribbon.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ribbon text */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#4A4A4A] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Ribbon Printed Text <span className="text-[#8A7A72] font-normal">(Optional, free)</span>
                </label>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="e.g. Happy Birthday Maya! or Forever Yours"
                  value={ribbonText}
                  onChange={(e) => setRibbonText(e.target.value)}
                  className="w-full border border-[rgba(216,170,185,0.4)] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#D1748C]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>

              {/* Greeting Card Themes */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#4A4A4A] mb-2 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Handwritten Card Occasion
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {CARD_THEMES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCard(c.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        selectedCard === c.name ? "bg-[#D1748C] text-white border-transparent" : "bg-white border-[rgba(216,170,185,0.3)] text-[#6E635F]"
                      }`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  placeholder="Write your personal message to be handwritten inside the card (Nepali or English)..."
                  value={cardMessage}
                  onChange={(e) => setCardMessage(e.target.value)}
                  className="w-full border border-[rgba(216,170,185,0.4)] rounded-xl p-3 text-xs focus:outline-none focus:border-[#D1748C]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>
            </section>

            {/* Step 4: Addons */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[rgba(216,170,185,0.3)] shadow-sm">
              <div className="flex items-center gap-2.5 mb-5 border-b border-[rgba(216,170,185,0.2)] pb-4">
                <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-bold">4</span>
                <h2 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Special Upgrades & Add-ons
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? "border-[#4F6F52] bg-[#EDF4EE]/60"
                          : "border-[rgba(216,170,185,0.25)] hover:border-[#D1748C]/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{addon.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {addon.name}
                          </p>
                          <p className="text-[11px] font-bold text-[#D1748C]">{fmt(addon.price)}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                        isChecked ? "bg-[#4F6F52] border-[#4F6F52] text-white" : "border-[#8A7A72]/40"
                      }`}>
                        {isChecked && <Check size={11} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Live Order Summary Column (Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[rgba(216,170,185,0.3)] shadow-lg">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(216,170,185,0.2)]">
                <h3 className="font-bold text-base text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Custom Bouquet Summary
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5E8EE] text-[#D1748C]">
                  {totalStems} Stems
                </span>
              </div>

              {/* Image Preview Banner */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-5 bg-[#F5E8EE] border border-[rgba(216,170,185,0.2)]">
                <img src={mixedPastelImg} alt="Custom bouquet preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-bold" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Bespoke Handcrafted Design
                  </p>
                  <p className="text-[11px] text-white/80">Made to order in Pokhara</p>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="space-y-2.5 text-xs text-[#5A5A5A] mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {/* Stem details */}
                <div className="flex justify-between font-medium">
                  <span>Selected Stems ({totalStems})</span>
                  <span className="text-[#2B2B2B]">{fmt(stemsCost)}</span>
                </div>
                {STEM_OPTIONS.filter((s) => (stemCounts[s.id] || 0) > 0).map((s) => (
                  <div key={s.id} className="flex justify-between pl-3 text-[11px] text-[#8A7A72]">
                    <span>• {s.name} × {stemCounts[s.id]}</span>
                    <span>{fmt(s.pricePerStem * stemCounts[s.id])}</span>
                  </div>
                ))}

                {/* Wrap */}
                <div className="flex justify-between font-medium pt-2 border-t border-[rgba(216,170,185,0.15)]">
                  <span>Wrapping: {WRAPPING_OPTIONS.find((w) => w.id === selectedWrap)?.name}</span>
                  <span className="text-[#2B2B2B]">{fmt(wrapCost)}</span>
                </div>

                {/* Ribbon */}
                <div className="flex justify-between font-medium">
                  <span>Ribbon: {RIBBON_OPTIONS.find((r) => r.id === selectedRibbon)?.name}</span>
                  <span className="text-emerald-700">Free</span>
                </div>
                {ribbonText && (
                  <p className="pl-3 text-[11px] text-[#8A7A72] italic">"{ribbonText}"</p>
                )}

                {/* Card */}
                <div className="flex justify-between font-medium">
                  <span>Card: {selectedCard}</span>
                  <span className="text-emerald-700">Free</span>
                </div>

                {/* Addons */}
                {selectedAddons.length > 0 && (
                  <>
                    <div className="flex justify-between font-medium pt-2 border-t border-[rgba(216,170,185,0.15)]">
                      <span>Add-ons ({selectedAddons.length})</span>
                      <span className="text-[#2B2B2B]">{fmt(addonsCost)}</span>
                    </div>
                    {selectedAddons.map((id) => {
                      const a = ADDONS.find((item) => item.id === id);
                      return a ? (
                        <div key={id} className="flex justify-between pl-3 text-[11px] text-[#8A7A72]">
                          <span>• {a.name}</span>
                          <span>{fmt(a.price)}</span>
                        </div>
                      ) : null;
                    })}
                  </>
                )}

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-[rgba(216,170,185,0.3)] text-base font-bold text-[#2B2B2B]">
                  <span>Total Estimated Price</span>
                  <span className="text-[#D1748C] text-xl">{fmt(totalCost)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={handleAddCustomToCart}
                  disabled={totalStems < 3}
                  className="w-full bg-[#1A1A1A] text-[#FFF8F3] py-3.5 rounded-full font-semibold hover:bg-[#D1748C] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <ShoppingBag size={16} /> Add Custom Bouquet to Cart
                </button>

                <a
                  href={`https://wa.me/9779769695263?text=${encodeURIComponent(
                    `Hi Roselle! I am looking to order a custom bouquet:\n- Stems: ${totalStems} stems\n- Wrap: ${selectedWrap}\n- Message: ${cardMessage || "None"}\n- Estimated Price: ${fmt(totalCost)}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full border border-[#25D366] text-[#25D366] bg-white py-2.5 rounded-full font-medium hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-2 text-xs"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <MessageCircle size={15} /> Discuss Custom Order on WhatsApp
                </a>
              </div>
            </div>

            {/* Assurance Card */}
            <div className="bg-[#EDF4EE] rounded-2xl p-4 border border-[rgba(79,111,82,0.2)] text-xs text-[#4F6F52] space-y-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <p className="font-semibold flex items-center gap-1.5">
                <Check size={14} /> 100% Everlasting Craftsmanship
              </p>
              <p className="text-[11px] leading-relaxed text-[#5A7D5E]">
                Every stem is hand-twisted with premium chenille fuzzy-wire. Will never wilt, turn brown, or require water. Delivered anywhere in Pokhara.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
