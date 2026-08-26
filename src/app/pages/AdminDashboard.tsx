import { useState, useEffect } from "react";
import {
  ShoppingBag, CheckCircle, Truck, XCircle, Clock,
  RefreshCw, LogOut, Eye, EyeOff, Lock, TrendingUp,
} from "lucide-react";

/* ── Types ── */
interface OrderItem { id: number; product_name: string; quantity: number; unit_price: number; }
interface Order {
  id: number;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  delivery_zone: string;
  gift_message?: string;
  total_amount: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  created_at: string;
  items: OrderItem[];
}

const fmt = (n: number) => `Rs. ${n.toLocaleString("en-NP")}`;

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "bg-amber-100 text-amber-700",   icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700",     icon: CheckCircle },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700",   icon: Truck },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600",       icon: XCircle },
};

const ADMIN_PASSWORD_KEY = "roselle_admin_pwd";

/* ═══════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [password, setPassword] = useState(sessionStorage.getItem(ADMIN_PASSWORD_KEY) || "");
  const [showPwd, setShowPwd] = useState(false);
  const [authed, setAuthed] = useState(!!sessionStorage.getItem(ADMIN_PASSWORD_KEY));
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchOrders = async (pwd = password) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        headers: { "x-admin-password": pwd },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.errors?.[0] || "Failed to load orders.");
        if (res.status === 401) { setAuthed(false); sessionStorage.removeItem(ADMIN_PASSWORD_KEY); }
        return;
      }
      setOrders(data.orders);
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchOrders(password);
    if (!error) {
      sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
      setAuthed(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
    setAuthed(false);
    setPassword("");
    setOrders([]);
  };

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: status as Order["status"] } : o))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (authed) fetchOrders();
  }, [authed]);

  /* ── Stats ── */
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total_amount, 0),
  };

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  /* ── Login Screen ── */
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#F5E8EE] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-[#D1748C]" />
            </div>
            <h1 className="text-2xl font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Admin Portal
            </h1>
            <p className="text-sm text-[#8A7A72] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Roselle · Order Management
            </p>
          </div>
          <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-[rgba(216,170,185,0.3)] p-6 shadow-sm space-y-4">
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[rgba(216,170,185,0.4)] rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:border-[#D1748C] focus:ring-2 focus:ring-[#E8A0B4]/20"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
              <button type="button" onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7A72] hover:text-[#D1748C]">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-xs text-red-500" style={{ fontFamily: "'Poppins', sans-serif" }}>{error}</p>}
            <button
              type="submit"
              disabled={!password || loading}
              className="w-full bg-[#1A1A1A] text-[#FFF8F3] py-3 rounded-full font-semibold hover:bg-[#D1748C] transition-all disabled:opacity-50"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ── Dashboard ── */
  return (
    <div className="min-h-screen bg-[#FFF8F3]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[rgba(216,170,185,0.25)] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#D1748C] tracking-widest uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>Roselle</span>
          <h1 className="text-lg font-bold text-[#2B2B2B]" style={{ fontFamily: "'Playfair Display', serif" }}>Order Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders()}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-[#8A7A72] hover:text-[#D1748C] transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-[#8A7A72] hover:text-red-500 transition-colors"
            style={{ fontFamily: "'Poppins', sans-serif" }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: stats.total, icon: ShoppingBag, color: "text-[#D1748C]", bg: "bg-[#F5E8EE]" },
            { label: "Pending",      value: stats.pending, icon: Clock,       color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Delivered",    value: stats.delivered, icon: Truck,     color: "text-green-600", bg: "bg-green-50" },
            { label: "Revenue",      value: fmt(stats.revenue), icon: TrendingUp, color: "text-[#4F6F52]", bg: "bg-[#EDF4EE]" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-[rgba(216,170,185,0.2)] p-4 shadow-sm">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-xs text-[#8A7A72] mb-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>{label}</p>
              <p className={`text-xl font-bold ${color}`} style={{ fontFamily: "'Poppins', sans-serif" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "confirmed", "delivered", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${filterStatus === s ? "bg-[#D1748C] text-white shadow-sm" : "bg-white border border-[rgba(216,170,185,0.3)] text-[#8A7A72] hover:border-[#D1748C]"}`}
              style={{ fontFamily: "'Poppins', sans-serif" }}>
              {s === "all" ? `All (${orders.length})` : `${s} (${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="text-center py-16 text-[#D1748C]">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3" />
            <p style={{ fontFamily: "'Poppins', sans-serif" }}>Loading orders…</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={36} className="mx-auto mb-3 text-[#E0D8D0]" />
            <p className="text-[#8A7A72] text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>No orders found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = sc.icon;
              const isExpanded = expandedId === order.id;

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-[rgba(216,170,185,0.2)] shadow-sm overflow-hidden">
                  {/* Order header */}
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#FFF8F3] transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>Order</p>
                        <p className="font-bold text-[#D1748C]" style={{ fontFamily: "'Poppins', sans-serif" }}>#{order.id}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[#2B2B2B] text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>{order.customer_name}</p>
                        <p className="text-xs text-[#8A7A72]" style={{ fontFamily: "'Poppins', sans-serif" }}>{order.phone} · {order.delivery_zone === "outside" ? "Outside Pokhara" : "Inside Pokhara"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#2B2B2B] hidden sm:block" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {fmt(order.total_amount)}
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${sc.color}`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                        <StatusIcon size={11} /> {sc.label}
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-[rgba(216,170,185,0.2)] px-5 py-4 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[10px] font-semibold text-[#8A7A72] uppercase tracking-widest mb-0.5">Email</p>
                          <p className="text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{order.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold text-[#8A7A72] uppercase tracking-widest mb-0.5">Address</p>
                          <p className="text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{order.address}</p>
                        </div>
                        {order.gift_message && (
                          <div className="sm:col-span-2">
                            <p className="text-[10px] font-semibold text-[#8A7A72] uppercase tracking-widest mb-0.5">Gift Message</p>
                            <p className="text-[#2B2B2B] italic" style={{ fontFamily: "'Poppins', sans-serif" }}>"{order.gift_message}"</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-semibold text-[#8A7A72] uppercase tracking-widest mb-0.5">Placed</p>
                          <p className="text-[#2B2B2B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{new Date(order.created_at).toLocaleString("en-NP")}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-[10px] font-semibold text-[#8A7A72] uppercase tracking-widest mb-2">Items</p>
                        <div className="space-y-1.5">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm bg-[#FFF8F3] rounded-lg px-3 py-2">
                              <span style={{ fontFamily: "'Poppins', sans-serif" }}>{item.product_name} <span className="text-[#8A7A72]">×{item.quantity}</span></span>
                              <span className="font-semibold text-[#D1748C]" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(item.unit_price * item.quantity)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-bold px-3 pt-1">
                            <span style={{ fontFamily: "'Poppins', sans-serif" }}>Total</span>
                            <span className="text-[#D1748C]" style={{ fontFamily: "'Poppins', sans-serif" }}>{fmt(order.total_amount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status change */}
                      <div>
                        <p className="text-[10px] font-semibold text-[#8A7A72] uppercase tracking-widest mb-2">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {(["pending", "confirmed", "delivered", "cancelled"] as const).map((s) => {
                            const cfg = STATUS_CONFIG[s];
                            return (
                              <button
                                key={s}
                                onClick={() => updateStatus(order.id, s)}
                                disabled={order.status === s || updatingId === order.id}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all border disabled:opacity-50 ${order.status === s ? `${cfg.color} border-transparent` : "bg-white border-[rgba(216,170,185,0.3)] text-[#8A7A72] hover:border-[#D1748C] hover:text-[#D1748C]"}`}
                                style={{ fontFamily: "'Poppins', sans-serif" }}>
                                {updatingId === order.id ? "…" : cfg.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* WhatsApp button */}
                      <a
                        href={`https://wa.me/${order.phone.startsWith("0") ? "977" + order.phone.slice(1) : "977" + order.phone}?text=${encodeURIComponent(`Hi ${order.customer_name}! Your Roselle order #${order.id} has been ${order.status}. Total: ${fmt(order.total_amount)}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white text-xs px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                        📱 WhatsApp Customer
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
