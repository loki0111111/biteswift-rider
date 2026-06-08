import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import RiderWalletPage from "./RiderWalletPage";
import ActiveDeliveryMap from "../components/ActiveDeliveryMap";
import useLocationSender from "../hooks/useLocationSender";
import RiderAccountTab from "./RiderAccountTab";

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

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
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

const IconWallet = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M22 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2"/>
  </svg>
);

const IconLoader = () => (
  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

function StatusBadge({ status }) {
  const map = {
    pending:      { label: "Pending",    cls: "bg-yellow-50 text-yellow-600 border-yellow-200" },
    assigned:     { label: "Assigned",   cls: "bg-blue-50 text-blue-600 border-blue-200" },
    "picked-up":  { label: "Picked Up",  cls: "bg-orange-50 text-orange-600 border-orange-200" },
    "in-transit": { label: "In Transit", cls: "bg-purple-50 text-purple-600 border-purple-200" },
    delivered:    { label: "Delivered",  cls: "bg-green-50 text-green-600 border-green-200" },
  };
  const s = map[status] || { label: status, cls: "bg-gray-100 text-gray-400 border-gray-200" };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceChecked, setMaintenanceChecked] = useState(false);

  useEffect(() => {
  fetch("https://biteswift-qw3s.onrender.com/api/settings/maintenance")
    .then(r => r.json())
    .then(data => {
      setMaintenance(data.businessMaintenance === true);
    })
    .catch(() => {})
    .finally(() => setMaintenanceChecked(true));
}, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/rider/profile");
      setRider(res.data.data);
    } catch {
      localStorage.removeItem("riderToken");
      navigate("/login");
    } finally {
      setLoadingProfile(false);
    }
  };

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

  const availableOrders = isAvailable
    ? orders.filter(o => (o.status === "pending" || o.status === "confirmed") && !o.riderId)
    : [];
  const myOrders = orders.filter(o => o.riderId);

  const activeOrder = myOrders.find(o =>
    o.status === "assigned" || o.status === "picked-up" || o.status === "in-transit"
  );
  useLocationSender(!!activeOrder);

  if (!maintenanceChecked) return null;

if (maintenance) return (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
    <div className="text-6xl mb-4">🔧</div>
    <h1 className="text-xl font-bold text-gray-800 mb-2">Under Maintenance</h1>
    <p className="text-gray-400 text-sm">BiteSwift is currently undergoing maintenance. Check back soon.</p>
  </div>
);

if (loadingProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-[#F97316] font-bold text-sm">
              {rider?.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{rider?.fullName}</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-green-500" : isOnDelivery ? "bg-blue-500" : "bg-gray-300"}`} />
                <p className="text-xs text-gray-400">{rider?.riderStatus}</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <IconLogOut />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-20">

        {activeTab !== "wallet" && activeTab !== "account" && (
          <div className={`rounded-2xl p-5 border transition-all ${
            isAvailable
              ? "bg-green-50 border-green-200"
              : isOnDelivery
              ? "bg-blue-50 border-blue-200"
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Current Status</p>
                <p className={`text-lg font-bold ${isAvailable ? "text-green-600" : isOnDelivery ? "text-blue-600" : "text-gray-400"}`}>
                  {rider?.riderStatus}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isAvailable
                    ? "You are visible to incoming orders"
                    : isOnDelivery
                    ? "Complete your delivery first"
                    : "You won't receive any orders"}
                </p>
              </div>
              <button
                onClick={toggleStatus}
                disabled={togglingStatus || isOnDelivery}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  isOnDelivery
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : isAvailable
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-[#F97316] text-white hover:bg-orange-600"
                }`}
              >
                {togglingStatus
                  ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  : isAvailable ? "Go Offline" : "Go Online"}
              </button>
            </div>
          </div>
        )}

        {activeTab !== "wallet" && activeTab !== "account" && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Wallet", value: `₦${Number(rider?.walletBalance || 0).toLocaleString()}` },
              { label: "Total Earned", value: `₦${Number(rider?.totalEarnings || 0).toLocaleString()}` },
              { label: "Vehicle", value: rider?.vehicleType || "—" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-3 text-center shadow-sm">
                <p className="text-sm font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab !== "wallet" && activeTab !== "account" && (
          <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
            {[
              { key: "available", label: `Available (${availableOrders.length})` },
              { key: "mydeliveries", label: `My Deliveries (${myOrders.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 text-xs py-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.key ? "bg-[#F97316] text-white" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === "wallet" && <RiderWalletPage rider={rider} />}
        {activeTab === "account" && <RiderAccountTab rider={rider} onLogout={handleLogout} />}

        {activeTab !== "wallet" && activeTab !== "account" && (
          <>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : activeTab === "available" ? (
              availableOrders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <IconPackage />
                  </div>
                  <p className="text-gray-400 text-sm">No available orders right now</p>
                  <p className="text-gray-300 text-xs mt-1">New orders will appear here</p>
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
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <IconCheck />
                  </div>
                  <p className="text-gray-400 text-sm">No active deliveries</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      actionLabel={order.status === "delivered" ? "Delivered ✓" : "Mark as Delivered"}
                      actionColor={order.status === "delivered" ? "bg-green-50 text-green-600 cursor-default" : "bg-green-500 hover:bg-green-600"}
                      onAction={order.status !== "delivered" ? () => markDelivered(order._id) : null}
                      loading={actionLoading === order._id}
                      showStatus
                    />
                  ))}
                </div>
              )
            )}
            <button
              onClick={fetchOrders}
              className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-600 text-sm font-medium rounded-xl transition-all shadow-sm"
            >
              Refresh Orders
            </button>
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-20">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {[
            { key: "available", label: "Orders", icon: <IconPackage /> },
            { key: "wallet", label: "Wallet", icon: <IconWallet /> },
            { key: "account", label: "Account", icon: <IconUser /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-all ${
                activeTab === tab.key ? "text-[#F97316]" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon}
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, actionLabel, actionColor, onAction, loading, showStatus }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1">Order #{order._id?.slice(-8).toUpperCase()}</p>
          <p className="text-sm font-bold text-gray-900">{order.customerName || "Customer"}</p>
        </div>
        {showStatus && <StatusBadge status={order.status} />}
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 text-gray-400">
          <span className="mt-0.5 shrink-0"><IconStore /></span>
          <p className="text-xs">{order.businessId?.restaurantName || "Restaurant"}</p>
        </div>
        <div className="flex items-start gap-2 text-gray-400">
          <span className="mt-0.5 shrink-0"><IconMapPin /></span>
          <p className="text-xs">{order.deliveryAddress || "No address provided"}</p>
        </div>
        {order.customerPhone && (
          <div className="flex items-center gap-2 text-gray-400">
            <IconPhone />
            <a href={`tel:${order.customerPhone}`} className="text-xs text-[#F97316] hover:underline">{order.customerPhone}</a>
          </div>
        )}
      </div>

      {(order.status === "assigned" || order.status === "picked-up" || order.status === "in-transit") && (
        <ActiveDeliveryMap order={order} />
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Your Delivery Fee</p>
          <p className="text-sm font-bold text-gray-900">₦{Number(order.deliveryFee || 0).toLocaleString()}</p>
        </div>
        {onAction && (
          <button
            onClick={onAction}
            disabled={loading}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all flex items-center gap-2 ${actionColor} disabled:opacity-50`}
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Working...</>
              : actionLabel}
          </button>
        )}
        {!onAction && (
          <span className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${actionColor}`}>{actionLabel}</span>
        )}
      </div>
    </div>
  );
}