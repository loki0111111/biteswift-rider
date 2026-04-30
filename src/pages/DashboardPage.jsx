import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconPackage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconStore = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const IconLogOut = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconLoader = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:    { label: "Pending",     cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    assigned:   { label: "Assigned",    cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    "picked-up":{ label: "Picked Up",   cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    "in-transit":{ label: "In Transit", cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    delivered:  { label: "Delivered",   cls: "bg-green-500/10 text-green-400 border-green-500/20" },
  };
  const s = map[status] || { label: status, cls: "bg-white/5 text-white/30 border-white/10" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("available"); // available | mydeliveries
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // orderId being acted on

  // Fetch rider profile
  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/rider/profile");
      setRider(res.data.data);
    } catch {
      // token invalid — log out
      localStorage.removeItem("riderToken");
      navigate("/login");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get("/rider/orders");
      setOrders(res.data.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  // Toggle Available / Offline
  const toggleStatus = async () => {
    if (!rider) return;
    const newStatus = rider.riderStatus === "Available" ? "Offline" : "Available";
    setTogglingStatus(true);
    try {
      await api.patch("/auth/rider/status", { riderStatus: newStatus });
      setRider((prev) => ({ ...prev, riderStatus: newStatus }));
    } catch {
      alert("Failed to update status. Please try again.");
    } finally {
      setTogglingStatus(false);
    }
  };

  // Accept an order
  const acceptOrder = async (orderId) => {
    setActionLoading(orderId);
    try {
      await api.post(`/rider/orders/${orderId}/accept`);
      await fetchOrders();
      setActiveTab("mydeliveries");
    } catch (err) {
      alert(err.response?.data?.message || "Could not accept order. It may have been taken.");
    } finally {
      setActionLoading(null);
    }
  };

  // Mark delivered
  const markDelivered = async (orderId) => {
    setActionLoading(orderId);
    try {
      await api.post(`/rider/orders/${orderId}/delivered`);
      await Promise.all([fetchOrders(), fetchProfile()]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as delivered.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("riderToken");
    navigate("/login");
  };

  const isAvailable = rider?.riderStatus === "Available";
  const isOnDelivery = rider?.riderStatus === "On Delivery";

  const availableOrders = orders.filter(o => 
    (o.status === "pending" || o.status === "confirmed") && !o.riderId
  );  const myOrders = orders.filter(o => o.riderId);

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/30 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">

      {/* ── Header ── */}
      <div className="bg-[#111111] border-b border-white/5 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F97316]/20 rounded-full flex items-center justify-center text-[#F97316] font-bold text-sm">
              {rider?.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{rider?.fullName}</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-green-400" : isOnDelivery ? "bg-blue-400" : "bg-white/20"}`} />
                <p className="text-xs text-white/40">{rider?.riderStatus}</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-white/30 hover:text-white/60 transition-colors">
            <IconLogOut />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* ── Status Toggle Card ── */}
        <div className={`rounded-2xl p-5 border transition-all ${isAvailable ? "bg-green-500/10 border-green-500/20" : isOnDelivery ? "bg-blue-500/10 border-blue-500/20" : "bg-[#111111] border-white/5"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 mb-1">Current Status</p>
              <p className={`text-lg font-bold ${isAvailable ? "text-green-400" : isOnDelivery ? "text-blue-400" : "text-white/40"}`}>
                {rider?.riderStatus}
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                {isAvailable ? "You are visible to incoming orders" : isOnDelivery ? "Complete your delivery first" : "You won't receive any orders"}
              </p>
            </div>
            <button
              onClick={toggleStatus}
              disabled={togglingStatus || isOnDelivery}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                isOnDelivery
                  ? "bg-white/5 text-white/20 cursor-not-allowed"
                  : isAvailable
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-[#F97316] text-white hover:bg-orange-600"
              }`}
            >
              {togglingStatus ? <IconLoader /> : isAvailable ? "Go Offline" : "Go Online"}
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Wallet", value: `₦${Number(rider?.walletBalance || 0).toLocaleString()}` },
            { label: "Total Earned", value: `₦${Number(rider?.totalEarnings || 0).toLocaleString()}` },
            { label: "Vehicle", value: rider?.vehicleType || "—" },
          ].map((s) => (
            <div key={s.label} className="bg-[#111111] border border-white/5 rounded-2xl p-3 text-center">
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/30 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-[#111111] border border-white/5 rounded-2xl p-1">
          {[
            { key: "available", label: `Available Orders (${availableOrders.length})` },
            { key: "mydeliveries", label: `My Deliveries (${myOrders.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-xs py-2 rounded-xl font-medium transition-all ${activeTab === tab.key ? "bg-[#F97316] text-white" : "text-white/40 hover:text-white"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Orders List ── */}
        {loadingOrders ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : activeTab === "available" ? (
          availableOrders.length === 0 ? (
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-10 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-white/20">
                <IconPackage />
              </div>
              <p className="text-white/30 text-sm">No available orders right now</p>
              <p className="text-white/20 text-xs mt-1">New orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  actionLabel="Accept Order"
                  actionColor="bg-[#F97316] hover:bg-orange-600"
                  onAction={() => acceptOrder(order._id)}
                  loading={actionLoading === order._id}
                />
              ))}
            </div>
          )
        ) : (
          myOrders.length === 0 ? (
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-10 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-white/20">
                <IconCheck />
              </div>
              <p className="text-white/30 text-sm">No active deliveries</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  actionLabel={order.status === "delivered" ? "Delivered ✓" : "Mark as Delivered"}
                  actionColor={order.status === "delivered" ? "bg-green-500/20 text-green-400 cursor-default" : "bg-green-500 hover:bg-green-600"}
                  onAction={order.status !== "delivered" ? () => markDelivered(order._id) : null}
                  loading={actionLoading === order._id}
                  showStatus
                />
              ))}
            </div>
          )
        )}

        {/* Refresh button */}
        <button
          onClick={fetchOrders}
          className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 text-sm font-medium rounded-xl transition-all"
        >
          Refresh Orders
        </button>

      </div>
    </div>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, actionLabel, actionColor, onAction, loading, showStatus }) {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/30 mb-1">Order #{order._id?.slice(-6).toUpperCase()}</p>
          <p className="text-sm font-bold text-white">{order.customerName || "Customer"}</p>
        </div>
        {showStatus && <StatusBadge status={order.status} />}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 text-white/50">
          <span className="mt-0.5 shrink-0"><IconStore /></span>
          <p className="text-xs">{order.businessId?.restaurantName || "Restaurant"}</p>
        </div>
        <div className="flex items-start gap-2 text-white/50">
          <span className="mt-0.5 shrink-0"><IconMapPin /></span>
          <p className="text-xs">{order.deliveryAddress || "No address provided"}</p>
        </div>
        {order.customerPhone && (
          <div className="flex items-center gap-2 text-white/50">
            <IconPhone />
            <a href={`tel:${order.customerPhone}`} className="text-xs text-[#F97316] hover:underline">{order.customerPhone}</a>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div>
          <p className="text-xs text-white/30">Order Total</p>
          <p className="text-sm font-bold text-white">₦{Number(order.totalAmount || 0).toLocaleString()}</p>
        </div>
        {onAction && (
          <button
            onClick={onAction}
            disabled={loading}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2 ${actionColor} disabled:opacity-50`}
          >
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Working...</> : actionLabel}
          </button>
        )}
        {!onAction && (
          <span className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${actionColor}`}>{actionLabel}</span>
        )}
      </div>
    </div>
  );
}