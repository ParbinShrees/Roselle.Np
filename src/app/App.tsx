import { useState, useEffect, useRef, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import emailjs from '@emailjs/browser';

/* ── Product images ── */
import sunflowerImg from "@/imports/Solei_Sunflower.jpg";
import pinkTulipImg from "@/imports/Pipecleaner_flower_bouquet___.jpg";
import mixedPastelImg from "@/imports/pipe_cleaners_bouquet.jpg";
import pinkLilyImg from "@/imports/download.jpg";
import blueDaisyImg from "@/imports/download__2_.jpg";
import blueLilyImg from "@/imports/download__1_.jpg";
import cherryFrameImg from "@/imports/ad4b1c7ced13e6ecae783651855cf6c9.jpg";
import birthdayBlueImg from "@/imports/8131f13c150e0211e44780db29283d91.jpg";
import sunshineFrameImg from "@/imports/Inbox_for_order.jpg";
import sunlitPinkImg from "@/imports/51eeaf66d8459a9bf8ee36c513d5fa03.jpg";

import {
  ShoppingBag, Search, X, Menu, ChevronRight, Minus, Plus,
  Trash2, Heart, MapPin, Phone, Instagram, Facebook, MessageCircle,
  Check, Filter, Cake, Gem, HeartHandshake, Crown, Sparkles, Gift,
  TrendingUp, TrendingDown, Minus as Stable, Star, ArrowRight,
  Eye, ArrowUpDown, Clock, Palette, Package,
} from "lucide-react";

/* ── TikTok SVG icon ── */
function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
    </svg>
  );
}

/* ── Social links ── */
const SOCIALS = {
  instagram: "https://www.instagram.com/theroselle_official/",
  whatsapp: "https://wa.me/9779769695263",
  tiktok: "https://www.tiktok.com/@theroselle_official",
  facebook: "https://facebook.com",
};

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
type Page = "home" | "flowers" | "new-arrivals" | "about" | "contact" | "product" | "checkout" | "confirmation";
type Trend = "up" | "down" | "stable";
type SortKey = "newest" | "price-asc" | "price-desc" | "name";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  color: string;
  flowerType: string;
  occasions: string[];
  isNewArrival: boolean;
  description: string;
  stock: boolean;
  badge?: string;
  trend: Trend;
  trendPct: number;
  category: "bouquet" | "frame" | "single";
  rating: number;
  reviews: number;
}

interface CartItem extends Product { qty: number; }

/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */
const PRODUCTS: Product[] = [
  {
    id: 1, name: "Soleil Sunflower Bouquet", price: 2200, image: sunflowerImg,
    color: "Yellow", flowerType: "Sunflower", occasions: ["Birthday", "Just Because", "Mother's Day"],
    isNewArrival: true, stock: true, badge: "Bestseller", trend: "up", trendPct: 5,
    category: "bouquet", rating: 4.9, reviews: 24,
    description: "Three lush fuzzy-wire sunflowers paired with white daisies and trailing green vines, wrapped in kraft paper with a 'Just For You' ribbon.",
  },
  {
    id: 2, name: "Blush Garden Bouquet", price: 1800, image: pinkTulipImg,
    color: "Pink", flowerType: "Tulip", occasions: ["Anniversary", "Valentine's Day", "Just Because"],
    isNewArrival: true, stock: true, badge: "New", trend: "stable", trendPct: 0,
    category: "bouquet", rating: 4.8, reviews: 18,
    description: "Soft pink tulips and daisy blooms in ivory paper with a blush satin ribbon. A gentle 'for you' card included.",
  },
  {
    id: 3, name: "Pastel Dream Bouquet", price: 2500, image: mixedPastelImg,
    color: "Mixed", flowerType: "Mixed", occasions: ["Wedding", "Anniversary", "Mother's Day"],
    isNewArrival: false, stock: true, trend: "up", trendPct: 8,
    category: "bouquet", rating: 5.0, reviews: 11,
    description: "Purple lilies, pink tulips, yellow tulips and white blooms in lavender paper with sheer tulle. Elegant for any occasion.",
  },
  {
    id: 4, name: "Rose Lily Bouquet", price: 2000, image: pinkLilyImg,
    color: "Pink", flowerType: "Rose", occasions: ["Valentine's Day", "Anniversary", "Birthday"],
    isNewArrival: true, stock: true, badge: "New", trend: "up", trendPct: 3,
    category: "bouquet", rating: 4.7, reviews: 9,
    description: "Full pink lilies with cherry blossom accents, wrapped in peach paper with pearl-trimmed tulle and an organza bow.",
  },
  {
    id: 5, name: "Sky & White Daisy Bundle", price: 1500, image: blueDaisyImg,
    color: "Blue", flowerType: "Daisy", occasions: ["Birthday", "Just Because"],
    isNewArrival: false, stock: true, trend: "down", trendPct: 2,
    category: "bouquet", rating: 4.6, reviews: 15,
    description: "A cheerful cloud of blue and white chenille daisies in a satisfying round bouquet with white organza wrap.",
  },
  {
    id: 6, name: "Aqua Lily Single", price: 1200, image: blueLilyImg,
    color: "Blue", flowerType: "Rose", occasions: ["Just Because", "Birthday"],
    isNewArrival: true, stock: true, badge: "New", trend: "stable", trendPct: 0,
    category: "single", rating: 4.5, reviews: 7,
    description: "One striking aqua lily in a teal cellophane wrap with a shimmer ribbon — minimal and utterly memorable.",
  },
  {
    id: 7, name: "Cherry Blossom Frame", price: 1800, image: cherryFrameImg,
    color: "Pink", flowerType: "Rose", occasions: ["Anniversary", "Just Because", "Valentine's Day"],
    isNewArrival: true, stock: true, badge: "New", trend: "up", trendPct: 12,
    category: "frame", rating: 4.9, reviews: 6,
    description: "Dozens of soft pink cherry blossoms in a natural wood shadow box with a heartfelt 'Dear my love' message card. A keepsake that lasts forever.",
  },
  {
    id: 8, name: "Birthday Blue Bouquet", price: 2600, image: birthdayBlueImg,
    color: "Blue", flowerType: "Mixed", occasions: ["Birthday", "Just Because"],
    isNewArrival: true, stock: true, badge: "New", trend: "stable", trendPct: 0,
    category: "bouquet", rating: 4.8, reviews: 4,
    description: "Blue lilies, white daisies, purple roses and soft lavender accents in white paper with a sky-blue ribbon. Comes with a Happy Birthday card.",
  },
  {
    id: 9, name: "Sunshine Frame Art", price: 2000, image: sunshineFrameImg,
    color: "Yellow", flowerType: "Sunflower", occasions: ["Birthday", "Mother's Day", "Just Because"],
    isNewArrival: true, stock: true, badge: "New", trend: "up", trendPct: 6,
    category: "frame", rating: 4.7, reviews: 3,
    description: "A bold sunflower centerpiece with pink and blue accent blooms in a white shadow box, finished with an organza bow and personalised message card.",
  },
  {
    id: 10, name: "Sunlit Pink Lily Wrap", price: 1700, image: sunlitPinkImg,
    color: "Pink", flowerType: "Tulip", occasions: ["Anniversary", "Wedding", "Mother's Day"],
    isNewArrival: true, stock: true, badge: "New", trend: "up", trendPct: 4,
    category: "bouquet", rating: 4.9, reviews: 5,
    description: "Graceful pink lilies with white daisy sprigs in a sheer pink tulle wrap — sun-drenched and effortlessly elegant.",
  },
];

const OCCASIONS = ["Birthday", "Anniversary", "Valentine's Day", "Wedding", "Just Because", "Mother's Day"];
const COLORS = ["Pink", "Blue", "Yellow", "Mixed"];
const FLOWER_TYPES = ["Tulip", "Rose", "Daisy", "Sunflower", "Mixed"];
const OCCASION_ICONS = [Cake, Gem, HeartHandshake, Crown, Gift, Sparkles];

const fmt = (n: number) => `Rs. ${n.toLocaleString("en-NP")}`;

/* ═══════════════════════════════════════════════
   TREND BADGE
═══════════════════════════════════════════════ */
function TrendBadge({ trend, pct }: { trend: Trend; pct: number }) {
  if (trend === "stable") return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#8A7A72] bg-[#F0E8E0] px-2 py-0.5 rounded-full">
      <Stable size={9} /> Stable
    </span>
  );
  if (trend === "up") return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
      <TrendingUp size={9} /> +{pct}%
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
      <TrendingDown size={9} /> -{pct}%
    </span>
  );
}

/* ═══════════════════════════════════════════════
   STAR RATING
═══════════════════════════════════════════════ */
function RatingStars({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={10}
            className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-[#E0D8D0]"}
          />
        ))}
      </div>
      <span className="text-[10px] text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PRODUCT CARD
═══════════════════════════════════════════════ */
function ProductCard({
  product,
  onView,
  onAddToCart,
  wishlisted,
  onWishlist,
}: {
  product: Product;
  onView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  wishlisted: boolean;
  onWishlist: (id: number) => void;
}) {
  const categoryLabel = product.category === "frame" ? "Frame Art" : product.category === "single" ? "Single Stem" : "Bouquet";

  return (
    <article
      className="group bg-white rounded-2xl overflow-hidden border border-[rgba(216,170,185,0.25)] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => onView(product)}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onView(product)}
      aria-label={`View ${product.name}, ${fmt(product.price)}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#F5E8EE]" style={{ aspectRatio: "3/4" }}>
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges row */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#1A1A1A] text-[#FFF8F3] leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {product.badge}
            </span>
          )}
          {!product.stock && (
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/90 text-[#8A7A72] leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Out of stock
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm
            ${wishlisted ? "bg-[#D1748C] text-white opacity-100 scale-100" : "bg-white/90 text-[#D1748C] opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100"}`}
          onClick={(e) => { e.stopPropagation(); onWishlist(product.id); }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={14} className={wishlisted ? "fill-white" : ""} />
        </button>

        {/* Quick view hint */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white/90 text-[#2B2B2B] px-3 py-1.5 rounded-full shadow-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <Eye size={10} /> Quick view
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {/* Category + trend */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium text-[#8A7A72] uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {categoryLabel} · {product.color}
          </span>
          <TrendBadge trend={product.trend} pct={product.trendPct} />
        </div>

        {/* Name */}
        <h3 className="font-semibold text-[#2B2B2B] leading-snug line-clamp-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.9375rem" }}>
          {product.name}
        </h3>

        {/* Rating */}
        <RatingStars rating={product.rating} count={product.reviews} />

        {/* Occasions */}
        <div className="flex flex-wrap gap-1">
          {product.occasions.slice(0, 2).map((o) => (
            <span key={o} className="text-[9px] font-medium text-[#4F6F52] bg-[#EDF4EE] px-2 py-0.5 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {o}
            </span>
          ))}
          {product.occasions.length > 2 && (
            <span className="text-[9px] font-medium text-[#8A7A72] bg-[#F0E8E0] px-2 py-0.5 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
              +{product.occasions.length - 2}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[rgba(216,170,185,0.2)]">
          <span className="text-[#D1748C] font-bold" style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.9375rem" }}>
            {fmt(product.price)}
          </span>
          <button
            className="text-xs bg-[#1A1A1A] text-[#FFF8F3] px-3.5 py-2 rounded-full font-medium hover:bg-[#D1748C] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!product.stock}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            style={{ fontFamily: "'Poppins', sans-serif" }}
            aria-label={`Add ${product.name} to cart`}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterColor, setFilterColor] = useState("All");
  const [filterFlower, setFilterFlower] = useState("All");
  const [filterOccasion, setFilterOccasion] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [qty, setQty] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", zone: "inside", note: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);


  /* Lock scroll */
  useEffect(() => {
    document.body.style.overflow = cartOpen || mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, mobileMenuOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  /* Cart helpers */
  const addToCart = useCallback((product: Product, q = 1) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === product.id);
      return ex
        ? prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + q } : i)
        : [...prev, { ...product, qty: q }];
    });
    toast.success(`${product.name} added to cart`, {
      description: fmt(product.price),
      duration: 2500,
    });
  }, []);

  const updateQty = (id: number, d: number) =>
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i));
  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
    toast.info("Item removed");
  };

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.info("Removed from wishlist"); }
      else { next.add(id); toast.success("Added to wishlist"); }
      return next;
    });
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  /* Search */
  const searchResults = searchQuery.length > 1
    ? PRODUCTS.filter((p) =>
        [p.name, p.color, p.flowerType, ...p.occasions].some((v) =>
          v.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : [];

  /* Filtered + sorted products */
  const filtered = PRODUCTS
    .filter((p) => filterColor === "All" || p.color === filterColor)
    .filter((p) => filterFlower === "All" || p.flowerType === filterFlower)
    .filter((p) => filterOccasion === "All" || p.occasions.includes(filterOccasion))
    .filter((p) => filterCategory === "All" || p.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.id - a.id;
    });

  const anyFilter = filterColor !== "All" || filterFlower !== "All" || filterOccasion !== "All" || filterCategory !== "All";
  const clearFilters = () => { setFilterColor("All"); setFilterFlower("All"); setFilterOccasion("All"); setFilterCategory("All"); };

  const navigate = (p: Page, product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setRecentlyViewed((prev) => [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 6));
    }
    setPage(p);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ─────────────────── HEADER ─────────────────── */
  const Header = () => (
    <header className="sticky top-0 z-50 bg-[#FFF8F3]/96 backdrop-blur-md border-b border-[rgba(216,170,185,0.25)] transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <button onClick={() => navigate("home")} className="flex-shrink-0 flex items-baseline gap-0.5" aria-label="Roselle home">
          <span className="text-[1.375rem] font-bold text-[#2B2B2B] tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>Roselle</span>
          <span className="text-[#D1748C] text-[1.375rem]" style={{ fontFamily: "'Playfair Display', serif" }}>.</span>
        </button>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4 flex-1">
          {(["home","new-arrivals","flowers","about","contact"] as Page[]).map((p) => (
            <button
              key={p}
              onClick={() => navigate(p)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                page === p
                  ? "bg-[#F5E8EE] text-[#D1748C] font-medium"
                  : "text-[#5A5A5A] hover:text-[#2B2B2B] hover:bg-[#F5E8EE]/50"
              }`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {p === "new-arrivals" ? "New Arrivals" : p === "home" ? "Home" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5E8EE] transition-colors"
            aria-label="Toggle search"
          >
            <Search size={17} className="text-[#2B2B2B]" />
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5E8EE] transition-colors"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingBag size={17} className="text-[#2B2B2B]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[#D1748C] text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5E8EE] transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Search panel */}
      {searchOpen && (
        <div className="border-t border-[rgba(216,170,185,0.2)] bg-[#FFF8F3]/98 px-4 sm:px-6 py-3 animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-2 bg-white border border-[rgba(216,170,185,0.4)] rounded-full px-4 py-2.5 shadow-sm focus-within:border-[#D1748C] focus-within:ring-2 focus-within:ring-[#E8A0B4]/20 transition-all">
              <Search size={15} className="text-[#8A7A72] flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search bouquets, colors, occasions…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-[#2B2B2B] placeholder:text-[#B0A0A0]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} aria-label="Clear search">
                  <X size={13} className="text-[#8A7A72] hover:text-[#D1748C] transition-colors" />
                </button>
              )}
            </div>

            {searchQuery.length > 1 && (
              <div className="mt-2 bg-white border border-[rgba(216,170,185,0.25)] rounded-2xl overflow-hidden shadow-lg">
                {searchResults.length === 0 ? (
                  <div className="p-5 text-center">
                    <p className="text-sm text-[#8A7A72] mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>Nothing found for "{searchQuery}"</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {PRODUCTS.slice(0, 3).map((p) => (
                        <button key={p.id} onClick={() => { navigate("product", p); setSearchQuery(""); }}
                          className="text-xs bg-[#F5E8EE] text-[#D1748C] px-3 py-1 rounded-full hover:bg-[#D1748C] hover:text-white transition-colors"
                          style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.map((p, i) => (
                  <button
                    key={p.id}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF8F3] transition-colors text-left ${i < searchResults.length - 1 ? "border-b border-[rgba(216,170,185,0.15)]" : ""}`}
                    onClick={() => { navigate("product", p); setSearchQuery(""); }}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#F5E8EE]">
                      <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#2B2B2B] truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.name}</p>
                      <p className="text-xs text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.color} · {p.flowerType}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#D1748C] flex-shrink-0" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(p.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[rgba(216,170,185,0.2)] bg-[#FFF8F3] px-5 py-4">
          {(["home","new-arrivals","flowers","about","contact"] as Page[]).map((p) => (
            <button
              key={p}
              onClick={() => navigate(p)}
              className={`flex items-center justify-between w-full py-3 text-sm border-b border-[rgba(216,170,185,0.15)] last:border-0 ${page === p ? "text-[#D1748C] font-medium" : "text-[#2B2B2B]"}`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {p === "new-arrivals" ? "New Arrivals" : p === "home" ? "Home" : p.charAt(0).toUpperCase() + p.slice(1)}
              <ChevronRight size={14} className="text-[#8A7A72]" />
            </button>
          ))}
        </div>
      )}
    </header>
  );

  /* ─────────────────── CART DRAWER ─────────────────── */
  const CartDrawer = () => (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-[2px]" onClick={() => setCartOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-[#FFF8F3] z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(216,170,185,0.25)]">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-semibold text-[#2B2B2B]">Your Basket</h2>
            {cart.length > 0 && <p className="text-xs text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>{cartCount} item{cartCount !== 1 ? "s" : ""}</p>}
          </div>
          <button onClick={() => setCartOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5E8EE] transition-colors" aria-label="Close cart">
            <X size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
              <div className="w-16 h-16 bg-[#F5E8EE] rounded-full flex items-center justify-center">
                <ShoppingBag size={24} className="text-[#E8A0B4]" />
              </div>
              <div>
                <p className="font-medium text-[#2B2B2B] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Your basket is empty</p>
                <p className="text-sm text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>Add something beautiful</p>
              </div>
              <button onClick={() => { setCartOpen(false); navigate("flowers"); }}
                className="bg-[#1A1A1A] text-[#FFF8F3] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D1748C] transition-colors"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                Shop Bouquets
              </button>
            </div>
          ) : cart.map((item) => (
            <div key={item.id} className="flex gap-3 bg-white p-3 rounded-xl border border-[rgba(216,170,185,0.2)] shadow-sm">
              <div className="w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[#F5E8EE]">
                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <p className="font-semibold text-sm text-[#2B2B2B] leading-tight line-clamp-2" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</p>
                <p className="text-[11px] text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.color} · {item.flowerType}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 bg-[#F5E8EE] rounded-full px-2.5 py-1">
                    <button onClick={() => updateQty(item.id, -1)} className="w-4 h-4 flex items-center justify-center hover:text-[#D1748C] transition-colors" aria-label="Decrease quantity">
                      <Minus size={10} />
                    </button>
                    <span className="text-xs font-semibold w-4 text-center tabular-nums" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-4 h-4 flex items-center justify-center hover:text-[#D1748C] transition-colors" aria-label="Increase quantity">
                      <Plus size={10} />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-[#D1748C]" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(item.price * item.qty)}</span>
                  <button onClick={() => removeItem(item.id)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-[#8A7A72] hover:text-red-400 transition-all" aria-label="Remove item">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-[rgba(216,170,185,0.25)] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>Subtotal</span>
              <span className="font-bold text-[#2B2B2B] text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(cartTotal)}</span>
            </div>
            <p className="text-[11px] text-[#8A7A72] text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Delivery cost confirmed at checkout · Cash on Delivery
            </p>
            <button
              onClick={() => { setCartOpen(false); navigate("checkout"); }}
              className="w-full bg-[#1A1A1A] text-[#FFF8F3] py-3 rounded-full font-semibold hover:bg-[#D1748C] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Proceed to Checkout <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  );

  /* ─────────────────── FOOTER ─────────────────── */
  const Footer = () => (
    <footer className="bg-[#1E1E1E] text-[#FFF8F3] pt-14 pb-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3">
              <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Roselle</span>
              <span className="text-[#E8A0B4] text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>.</span>
            </div>
            <p className="text-sm text-[#7A7A7A] leading-relaxed mb-5 max-w-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Handmade fuzzy-wire bouquets from Rambazar, Pokhara. Never wilts. Lasts forever.
            </p>
            <div className="flex gap-2">
              <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D1748C] transition-colors">
                <Instagram size={15} />
              </a>
              <a href={SOCIALS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#D1748C] transition-colors">
                <TikTokIcon size={15} />
              </a>
              <a href={SOCIALS.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#25D366] transition-colors">
                <MessageCircle size={15} />
              </a>
              <a href={SOCIALS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#1877F2] transition-colors">
                <Facebook size={15} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold mb-4 text-[#E8A0B4] uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>Shop</h4>
            <div className="space-y-2.5">
              {(["home","new-arrivals","flowers","about","contact"] as Page[]).map((p) => (
                <button key={p} onClick={() => navigate(p)}
                  className="block text-sm text-[#7A7A7A] hover:text-[#FFF8F3] transition-colors"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {p === "new-arrivals" ? "New Arrivals" : p === "home" ? "Home" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold mb-4 text-[#E8A0B4] uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>Contact</h4>
            <div className="space-y-3">
              {([[Phone, "9769695263"], [MapPin, "Rambazar, Pokhara, Nepal"]] as [React.ElementType, string][]).map(([Icon, text]) => (
                <div key={text} className="flex items-start gap-2">
                  <Icon size={13} className="text-[#E8A0B4] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-[#7A7A7A]" style={{ fontFamily: "'Poppins', sans-serif" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold mb-4 text-[#E8A0B4] uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>Delivery</h4>
            <p className="text-sm text-[#7A7A7A] leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Cash on Delivery inside Pokhara Valley. Outside the valley, we confirm delivery cost before shipping.
            </p>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-5 flex flex-col sm:flex-row justify-between gap-2">
          <p className="text-xs text-[#4A4A4A]" style={{ fontFamily: "'Poppins', sans-serif" }}>© 2026 Roselle. All rights reserved.</p>
          <p className="text-xs text-[#4A4A4A]" style={{ fontFamily: "'Poppins', sans-serif" }}>Made with care in Pokhara, Nepal 🌸</p>
        </div>
      </div>
    </footer>
  );

  /* ─────────────────── HOME ─────────────────── */
  const HomePage = () => {
    const newArrivals = PRODUCTS.filter((p) => p.isNewArrival);
    const featured = PRODUCTS.sort((a, b) => b.rating - a.rating).slice(0, 4);

    return (
      <div>
        {/* Hero */}
        <section className="bg-[#FFF8F3] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 items-center gap-8 lg:gap-0 py-14 sm:py-16 lg:py-0 lg:min-h-[90vh]">

              {/* Text — below image on mobile, left on desktop */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left order-2 lg:order-1 lg:pr-10">
                <div className="inline-flex items-center gap-2 bg-[#F5E8EE] text-[#D1748C] text-xs font-medium px-3 py-1.5 rounded-full mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <Sparkles size={11} /> Handcrafted in Rambazar, Pokhara
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#2B2B2B] leading-[1.1] tracking-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Flowers That<br />
                  <em className="text-[#D1748C] not-italic">Never</em> Fade.
                </h1>
                <p className="text-sm sm:text-base text-[#5A5A5A] leading-relaxed mb-7 max-w-[360px]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Soft fuzzy-wire bouquets — tulips, roses, daisies &amp; sunflowers. Handcrafted, everlasting, delivered across Pokhara.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                  <button onClick={() => navigate("flowers")}
                    className="bg-[#1A1A1A] text-[#FFF8F3] px-7 py-3 rounded-full font-medium hover:bg-[#D1748C] active:scale-[0.97] transition-all flex items-center gap-2 shadow-md"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Shop Bouquets <ArrowRight size={15} />
                  </button>
                  <button onClick={() => navigate("new-arrivals")}
                    className="border border-[rgba(43,43,43,0.3)] text-[#2B2B2B] px-7 py-3 rounded-full font-medium hover:border-[#D1748C] hover:text-[#D1748C] transition-all"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    New Arrivals
                  </button>
                </div>
                {/* Stats */}
                <div className="flex gap-8 justify-center lg:justify-start">
                  {[["10+", "Bouquet styles"], ["100%", "Handmade"], ["COD", "Delivery"]].map(([n, l]) => (
                    <div key={l} className="text-center lg:text-left">
                      <p className="text-2xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>{n}</p>
                      <p className="text-[11px] text-[#8A7A72] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image — top on mobile, right on desktop */}
              <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-none lg:w-[90%] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-[#E8A0B4]/20">
                  <ImageWithFallback
                    src={pinkTulipImg}
                    alt="Roselle blush garden bouquet"
                    className="w-full h-full object-cover"
                  />
                  {/* Floating badge */}
                  <div className="absolute bottom-5 left-5 right-5 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg">
                    <div>
                      <p className="text-xs font-semibold text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Blush Garden Bouquet</p>
                      <p className="text-sm font-bold text-[#D1748C]" style={{ fontFamily: "'Poppins', sans-serif" }}>Rs. 1,800</p>
                    </div>
                    <button onClick={() => addToCart(PRODUCTS[1])}
                      className="bg-[#1A1A1A] text-white text-xs px-3 py-2 rounded-full hover:bg-[#D1748C] transition-colors"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Trust bar */}
        <section className="bg-white border-y border-[rgba(216,170,185,0.2)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4">
              {([
                [Sparkles, "100% Handmade", "Every petal shaped by hand"],
                [Star, "Lasts Forever", "No wilting, ever"],
                [Palette, "Custom Colors", "Pick your palette"],
                [Package, "COD Delivery", "Cash on delivery, Pokhara"],
              ] as [React.ElementType, string, string][]).map(([Icon, h, s]) => (
                <div key={h} className="flex flex-col items-center text-center gap-2 md:border-r md:last:border-r-0 md:border-[rgba(216,170,185,0.2)] md:px-4">
                  <div className="w-9 h-9 rounded-full bg-[#F5E8EE] flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-[#D1748C]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{h}</p>
                    <p className="text-xs text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-semibold text-[#D1748C] tracking-widest uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Fresh Picks</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2B2B2B] mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>New Arrivals</h2>
            </div>
            <button onClick={() => navigate("new-arrivals")}
              className="hidden sm:flex items-center gap-1 text-sm text-[#D1748C] hover:gap-2 transition-all font-medium"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {newArrivals.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p}
                onView={(pr) => navigate("product", pr)}
                onAddToCart={addToCart}
                wishlisted={wishlist.has(p.id)}
                onWishlist={toggleWishlist}
              />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <button onClick={() => navigate("new-arrivals")}
              className="text-sm text-[#D1748C] font-medium flex items-center gap-1 mx-auto"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              View all new arrivals <ChevronRight size={14} />
            </button>
          </div>
        </section>

        {/* Shop by Occasion */}
        <section className="bg-[#F5E8EE]/40 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold text-[#D1748C] tracking-widest uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Find your match</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2B2B2B] mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>Shop by Occasion</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {OCCASIONS.map((occ, i) => {
                const Icon = OCCASION_ICONS[i];
                return (
                  <button key={occ}
                    onClick={() => { setFilterOccasion(occ); navigate("flowers"); }}
                    className="bg-white border border-[rgba(216,170,185,0.25)] rounded-2xl p-4 text-center hover:border-[#D1748C] hover:shadow-md active:scale-95 transition-all group">
                    <div className="w-10 h-10 bg-[#F5E8EE] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#D1748C] transition-colors">
                      <Icon size={17} className="text-[#D1748C] group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-xs font-medium text-[#2B2B2B] group-hover:text-[#D1748C] transition-colors leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>{occ}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured / top rated */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Text — centered on mobile, left on desktop */}
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <span className="text-xs font-semibold text-[#D1748C] tracking-widest uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Crafted with love</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#2B2B2B] mt-2 mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Every Petal,<br />Shaped by Hand</h2>
              <p className="text-[#5A5A5A] leading-relaxed mb-6 max-w-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
                No two bouquets are exactly alike — and none of them ever wilt. Add lasting beauty to your home, your desk, or someone's day.
              </p>
              <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
                {FLOWER_TYPES.map((f) => (
                  <button key={f} onClick={() => { setFilterFlower(f); navigate("flowers"); }}
                    className="text-xs bg-[#F5E8EE] text-[#D1748C] px-4 py-1.5 rounded-full hover:bg-[#D1748C] hover:text-white transition-colors font-medium"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>{f}</button>
                ))}
              </div>
              <button onClick={() => navigate("flowers")}
                className="bg-[#1A1A1A] text-[#FFF8F3] px-8 py-3 rounded-full font-medium hover:bg-[#D1748C] transition-all active:scale-[0.97] flex items-center gap-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
                Browse All Bouquets <ArrowRight size={15} />
              </button>
            </div>
            {/* Image mosaic — equal 2-col on mobile, tall-first on desktop */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {featured.map((p, i) => (
                <button key={p.id} onClick={() => navigate("product", p)}
                  className={`group overflow-hidden rounded-2xl bg-[#F5E8EE] relative ${i === 0 ? "lg:row-span-2 aspect-square lg:aspect-[3/5]" : "aspect-square"}`}>
                  <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 left-3 right-3 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                    <p className="text-white text-xs font-semibold truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>{p.name}</p>
                    <p className="text-white/80 text-[10px]" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(p.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* About teaser */}
        <section className="bg-[#2B2B2B] py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-xs font-semibold text-[#E8A0B4] tracking-widest uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Our Story</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#FFF8F3] mt-2 mb-5 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>A New Shop,<br />Made with Real Care</h2>
            <p className="text-[#7A7A7A] leading-relaxed mb-8 max-w-lg mx-auto" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Roselle is a home-grown flower shop from Rambazar, Pokhara. Every bouquet is handcrafted from soft fuzzy wire — no wilting, no fading, just lasting beauty. We put real care into every petal and every order.
            </p>
            <button onClick={() => navigate("about")}
              className="border border-[#E8A0B4] text-[#E8A0B4] px-8 py-3 rounded-full font-medium hover:bg-[#E8A0B4] hover:text-[#2B2B2B] active:scale-[0.97] transition-all"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              Read Our Story
            </button>
          </div>
        </section>

        {/* Social CTA */}
        <section className="bg-gradient-to-b from-[#FFF8F3] to-[#F5E8EE] py-12 px-4">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-sm font-semibold text-[#D1748C] mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Stay in the loop</p>
            <h2 className="text-2xl font-bold text-[#2B2B2B] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Follow for New Drops</h2>
            <p className="text-sm text-[#8A7A72] mb-6" style={{ fontFamily: "'Poppins', sans-serif" }}>Be the first to see new bouquets and limited collections.</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <Instagram size={14} /> Instagram
              </a>
              <a href={SOCIALS.whatsapp} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a href={SOCIALS.tiktok} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-80 transition-opacity" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <TikTokIcon size={14} /> TikTok
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  };

  /* ─────────────────── FILTER BAR ─────────────────── */
  const FilterBar = ({ count }: { count: number }) => (
    <div className="bg-white border-b border-[rgba(216,170,185,0.2)] sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {/* Category pills */}
          {[["All", "All"], ["bouquet", "Bouquets"], ["frame", "Frame Art"], ["single", "Singles"]].map(([val, label]) => (
            <button key={val}
              onClick={() => setFilterCategory(val)}
              className={`flex-shrink-0 text-xs font-medium px-4 py-2 rounded-full border transition-all ${
                filterCategory === val
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-white text-[#5A5A5A] border-[rgba(216,170,185,0.4)] hover:border-[#D1748C] hover:text-[#D1748C]"
              }`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >{label}</button>
          ))}

          <div className="w-px h-5 bg-[rgba(216,170,185,0.4)] flex-shrink-0 mx-1" />

          {/* Color */}
          <select value={filterColor} onChange={(e) => setFilterColor(e.target.value)}
            className="flex-shrink-0 text-xs border border-[rgba(216,170,185,0.4)] px-3 py-2 rounded-full bg-white focus:outline-none focus:border-[#D1748C] cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}>
            <option value="All">All Colors</option>
            {COLORS.map((c) => <option key={c}>{c}</option>)}
          </select>

          {/* Flower type */}
          <select value={filterFlower} onChange={(e) => setFilterFlower(e.target.value)}
            className="flex-shrink-0 text-xs border border-[rgba(216,170,185,0.4)] px-3 py-2 rounded-full bg-white focus:outline-none focus:border-[#D1748C] cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}>
            <option value="All">All Flowers</option>
            {FLOWER_TYPES.map((f) => <option key={f}>{f}</option>)}
          </select>

          {/* Occasion */}
          <select value={filterOccasion} onChange={(e) => setFilterOccasion(e.target.value)}
            className="flex-shrink-0 text-xs border border-[rgba(216,170,185,0.4)] px-3 py-2 rounded-full bg-white focus:outline-none focus:border-[#D1748C] cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}>
            <option value="All">All Occasions</option>
            {OCCASIONS.map((o) => <option key={o}>{o}</option>)}
          </select>

          {/* Sort */}
          <div className="flex-shrink-0 ml-auto flex items-center gap-1">
            <ArrowUpDown size={13} className="text-[#8A7A72]" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="text-xs border-0 bg-transparent focus:outline-none cursor-pointer text-[#5A5A5A]"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low–High</option>
              <option value="price-desc">Price: High–Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          {anyFilter && (
            <button onClick={clearFilters}
              className="flex-shrink-0 flex items-center gap-1 text-xs text-[#D1748C] font-medium hover:underline ml-1"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              <X size={11} /> Clear ({count})
            </button>
          )}
        </div>
      </div>
    </div>
  );

  /* ─────────────────── FLOWERS PAGE ─────────────────── */
  const FlowersPage = () => (
    <div>
      <FilterBar count={filtered.length} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>All Bouquets</h1>
          <p className="text-sm text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-[#F5E8EE] rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={22} className="text-[#E8A0B4]" />
            </div>
            <p className="text-lg font-semibold text-[#2B2B2B] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>No bouquets found</p>
            <p className="text-sm text-[#8A7A72] mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>Try adjusting your filters</p>
            <button onClick={clearFilters} className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#D1748C] transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p}
                onView={(pr) => navigate("product", pr)}
                onAddToCart={addToCart}
                wishlisted={wishlist.has(p.id)}
                onWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ─────────────────── NEW ARRIVALS PAGE ─────────────────── */
  const NewArrivalsPage = () => {
    const items = PRODUCTS.filter((p) => p.isNewArrival);
    return (
      <div>
        <div className="bg-gradient-to-b from-[#F5E8EE] to-[#FFF8F3] py-14 text-center px-4">
          <span className="text-xs font-semibold text-[#D1748C] tracking-widest uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Just landed</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#2B2B2B] mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>New Arrivals</h1>
          <p className="text-sm text-[#8A7A72] mt-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{items.length} fresh additions to the collection</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {items.map((p) => (
              <ProductCard key={p.id} product={p}
                onView={(pr) => navigate("product", pr)}
                onAddToCart={addToCart}
                wishlisted={wishlist.has(p.id)}
                onWishlist={toggleWishlist}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────── PRODUCT DETAIL ─────────────────── */
  const ProductDetailPage = () => {
    const product = selectedProduct;
    if (!product) return null;
    const related = PRODUCTS.filter((p) => p.id !== product.id && (p.color === product.color || p.flowerType === product.flowerType)).slice(0, 4);

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <button onClick={() => navigate("flowers")}
          className="flex items-center gap-1.5 text-sm text-[#8A7A72] hover:text-[#D1748C] transition-colors mb-8 group"
          style={{ fontFamily: "'Poppins', sans-serif" }}>
          <ChevronRight size={13} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" />
          Back to Flowers
        </button>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          {/* Image */}
          <div className="bg-[#F5E8EE] rounded-3xl overflow-hidden" style={{ aspectRatio: "4/5" }}>
            <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex flex-col py-2">
            {/* Badges */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {product.badge && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#1A1A1A] text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>{product.badge}</span>
              )}
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-[#F5E8EE] text-[#D1748C]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {product.category === "frame" ? "Frame Art" : product.category === "single" ? "Single Stem" : "Bouquet"}
              </span>
              <TrendBadge trend={product.trend} pct={product.trendPct} />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-[#2B2B2B] leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              {product.name}
            </h1>

            <RatingStars rating={product.rating} count={product.reviews} />

            <p className="text-2xl font-bold text-[#D1748C] mt-4 mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(product.price)}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs bg-[#F5E8EE] text-[#D1748C] px-3 py-1 rounded-full font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>{product.color}</span>
              <span className="text-xs bg-[#F5E8EE] text-[#D1748C] px-3 py-1 rounded-full font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>{product.flowerType}</span>
              {product.occasions.map((o) => (
                <span key={o} className="text-xs bg-[#EDF4EE] text-[#4F6F52] px-3 py-1 rounded-full font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>{o}</span>
              ))}
            </div>

            <p className="text-[#5A5A5A] leading-relaxed mb-5" style={{ fontFamily: "'Poppins', sans-serif" }}>{product.description}</p>

            {/* Care note */}
            <div className="bg-[#EDF4EE] border border-[rgba(79,111,82,0.2)] rounded-xl p-3.5 mb-6 flex items-start gap-2.5">
              <span className="text-[#4F6F52] text-base flex-shrink-0">♾</span>
              <p className="text-xs text-[#4F6F52] leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Wipe clean, never fades, reusable forever. No water needed — fuzzy-wire construction lasts a lifetime.
              </p>
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-3 bg-[#F5E8EE] rounded-full px-4 py-2.5">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="hover:text-[#D1748C] transition-colors" aria-label="Decrease">
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-semibold tabular-nums" style={{ fontFamily: "'Poppins', sans-serif" }}>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="hover:text-[#D1748C] transition-colors" aria-label="Increase">
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={() => { addToCart(product, qty); setQty(1); }}
                disabled={!product.stock}
                className="flex-1 bg-[#1A1A1A] text-[#FFF8F3] py-3 rounded-full font-semibold hover:bg-[#D1748C] active:scale-[0.97] transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <ShoppingBag size={15} /> Add to Cart · {fmt(product.price * qty)}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all ${wishlist.has(product.id) ? "bg-[#D1748C] border-[#D1748C] text-white" : "border-[rgba(216,170,185,0.5)] text-[#D1748C] hover:border-[#D1748C]"}`}
                aria-label="Toggle wishlist"
              >
                <Heart size={16} className={wishlist.has(product.id) ? "fill-white" : ""} />
              </button>
            </div>

            {/* Trust */}
            <div className="flex flex-wrap gap-4 text-xs text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              {["100% Handmade", "Cash on Delivery", "Pokhara Delivery"].map((t) => (
                <span key={t} className="flex items-center gap-1">
                  <Check size={11} className="text-[#4F6F52]" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-[#2B2B2B] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>You Might Also Love</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id} product={p}
                  onView={(pr) => navigate("product", pr)}
                  onAddToCart={addToCart}
                  wishlisted={wishlist.has(p.id)}
                  onWishlist={toggleWishlist}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ─────────────────── CHECKOUT ─────────────────── */
  const renderCheckoutPage = () => {
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

        const res = await fetch("http://localhost:3001/api/orders", {
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
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
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
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
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
                  <input type="radio" name="zone" value={v} checked={form.zone === v} onChange={() => setForm((f) => ({ ...f, zone: v }))} className="mt-0.5 accent-[#D1748C]" />
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
              <textarea id="gift-note" rows={3} placeholder="Add a personal note…" value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                className="w-full border border-[rgba(216,170,185,0.35)] rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-[#D1748C] focus:ring-2 focus:ring-[#E8A0B4]/20 text-sm resize-none transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
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
          <div className="bg-white border border-[rgba(216,170,185,0.25)] rounded-2xl p-5 sticky top-20">
            <h2 className="font-semibold text-[#2B2B2B] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#F5E8EE]">
                    <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#2B2B2B] truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>{item.name}</p>
                    <p className="text-[10px] text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>×{item.qty}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#D1748C] flex-shrink-0" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(item.price * item.qty)}</span>
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
                <span className="text-sm text-[#4F6F52]" style={{ fontFamily: "'Poppins', sans-serif" }}>Confirmed later</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ─────────────────── CONFIRMATION ─────────────────── */
  const ConfirmationPage = () => (
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

  /* ─────────────────── ABOUT ─────────────────── */
  const AboutPage = () => (
    <div>
      <div className="bg-gradient-to-b from-[#F5E8EE] to-[#FFF8F3] py-16 text-center px-4">
        <span className="text-xs font-semibold text-[#D1748C] tracking-widest uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Our Story</span>
        <h1 className="text-5xl font-bold text-[#2B2B2B] mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>About Roselle</h1>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-14 items-center mb-16">
          <div className="grid grid-cols-2 gap-3">
            {[sunflowerImg, pinkTulipImg, cherryFrameImg, sunlitPinkImg].map((img, i) => (
              <div key={i} className={`overflow-hidden rounded-2xl bg-[#F5E8EE] ${i % 2 === 0 ? "aspect-[3/4]" : "aspect-[3/4] mt-5"}`}>
                <ImageWithFallback src={img} alt="Roselle bouquet" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#2B2B2B] mb-5 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Made by Hand,<br />Loved Forever</h2>
            <p className="text-[#5A5A5A] leading-relaxed mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Roselle is a new, home-grown flower shop based in Rambazar, Pokhara. Every bouquet is handcrafted from soft fuzzy wire — no wilting, no fading, just lasting beauty you can keep forever.
            </p>
            <p className="text-[#5A5A5A] leading-relaxed mb-7" style={{ fontFamily: "'Poppins', sans-serif" }}>
              We're just getting started, but we put real care into every petal and every order. Whether it's a birthday, an anniversary, or just because — we'd love to add a little color to your day.
            </p>
            <div className="space-y-3">
              {([[MapPin, "Rambazar, Pokhara, Nepal"], [Phone, "9769695263"], [Check, "Cash on Delivery inside Pokhara Valley"]] as [React.ElementType, string][]).map(([Icon, text]) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-[#5A5A5A]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <Icon size={13} className="text-[#D1748C] flex-shrink-0" /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["10+", "Bouquet styles"], ["100%", "Handmade"], ["∞", "Never wilts"], ["COD", "Pokhara delivery"]].map(([n, l]) => (
            <div key={l} className="bg-[#F5E8EE] rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-[#D1748C] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{n}</p>
              <p className="text-sm text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* ─────────────────── CONTACT ─────────────────── */
  const ContactPage = () => {
    const [msg, setMsg] = useState({ name: "", contact: "", message: "" });
    const [sent, setSent] = useState(false);
    return (
      <div>
        <div className="bg-gradient-to-b from-[#F5E8EE] to-[#FFF8F3] py-16 text-center px-4">
          <span className="text-xs font-semibold text-[#D1748C] tracking-widest uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Get in touch</span>
          <h1 className="text-5xl font-bold text-[#2B2B2B] mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>Contact Us</h1>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-[#2B2B2B] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Send a Message</h2>
              {sent ? (
                <div className="bg-[#EDF4EE] border border-[rgba(79,111,82,0.2)] rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 bg-[#4F6F52]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Check size={22} className="text-[#4F6F52]" />
                  </div>
                  <p className="font-semibold text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Message sent!</p>
                  <p className="text-sm text-[#8A7A72] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>We'll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSent(true); toast.success("Message sent!"); }} className="space-y-4">
                  {[{ k: "name", l: "Name", t: "text", ph: "Your name" }, { k: "contact", l: "Phone / Email", t: "text", ph: "Your contact" }].map(({ k, l, t, ph }) => (
                    <div key={k}>
                      <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>{l}</label>
                      <input type={t} required placeholder={ph} value={msg[k as keyof typeof msg]}
                        onChange={(e) => setMsg((m) => ({ ...m, [k]: e.target.value }))}
                        className="w-full border border-[rgba(216,170,185,0.35)] rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-[#D1748C] focus:ring-2 focus:ring-[#E8A0B4]/20 text-sm transition-all"
                        style={{ fontFamily: "'Poppins', sans-serif" }} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-[#2B2B2B] mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Message</label>
                    <textarea required rows={4} placeholder="How can we help?" value={msg.message}
                      onChange={(e) => setMsg((m) => ({ ...m, message: e.target.value }))}
                      className="w-full border border-[rgba(216,170,185,0.35)] rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:border-[#D1748C] focus:ring-2 focus:ring-[#E8A0B4]/20 text-sm resize-none transition-all"
                      style={{ fontFamily: "'Poppins', sans-serif" }} />
                  </div>
                  <button type="submit" className="w-full bg-[#1A1A1A] text-[#FFF8F3] py-3 rounded-full font-semibold hover:bg-[#D1748C] transition-all active:scale-[0.98]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Send Message
                  </button>
                </form>
              )}
            </div>
            <div className="space-y-5">
              <h2 className="text-2xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>Shop Info</h2>
              <div className="bg-white border border-[rgba(216,170,185,0.25)] rounded-2xl p-5 space-y-4">
                {([[Phone, "Phone", "9769695263"], [MapPin, "Location", "Rambazar, Pokhara, Nepal"], [Clock, "Hours", "Open daily · Hours vary"]] as [React.ElementType, string, string][]).map(([Icon, l, v]) => (
                  <div key={l} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#F5E8EE] rounded-full flex items-center justify-center flex-shrink-0 text-[#D1748C]">
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#8A7A72] uppercase tracking-wide" style={{ fontFamily: "'Poppins', sans-serif" }}>{l}</p>
                      <p className="text-sm font-medium text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{v}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#EDF4EE] border border-[rgba(79,111,82,0.15)] rounded-2xl p-4">
                <p className="text-xs font-semibold text-[#4F6F52] uppercase tracking-wide mb-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Delivery Policy</p>
                <p className="text-sm text-[#5A5A5A] leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Cash on Delivery inside Pokhara Valley. Outside the valley, delivery cost depends on the route — we'll confirm before shipping.
                </p>
              </div>
              <div className="bg-[#F5E8EE] rounded-2xl h-40 flex items-center justify-center border border-[rgba(216,170,185,0.2)]">
                <div className="text-center">
                  <MapPin size={22} className="text-[#D1748C] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Rambazar, Pokhara, Nepal</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
              {[
                  { href: SOCIALS.instagram, Icon: Instagram, label: "Instagram" },
                  { href: SOCIALS.tiktok, Icon: TikTokIcon, label: "TikTok" },
                  { href: SOCIALS.whatsapp, Icon: MessageCircle, label: "WhatsApp" },
                ].map(({ href, Icon, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 border border-[rgba(216,170,185,0.4)] px-4 py-2 rounded-full text-sm text-[#2B2B2B] hover:border-[#D1748C] hover:text-[#D1748C] transition-all"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                    <Icon size={13} /> {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#FFF8F3] flex flex-col">
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { fontFamily: "'Poppins', sans-serif", fontSize: "13px", borderRadius: "12px" },
        }}
      />
      <Header />
      {cartOpen && <CartDrawer />}

      <main className="flex-1">
        {page === "home" && <HomePage />}
        {page === "flowers" && <FlowersPage />}
        {page === "new-arrivals" && <NewArrivalsPage />}
        {page === "product" && <ProductDetailPage />}
        {page === "checkout" && renderCheckoutPage()}
        {page === "confirmation" && <ConfirmationPage />}
        {page === "about" && <AboutPage />}
        {page === "contact" && <ContactPage />}
      </main>

      {page !== "confirmation" && <Footer />}
    </div>
  );
}
