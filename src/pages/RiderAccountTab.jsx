import { useState } from "react";
import api from "../services/api";

export default function RiderAccountTab({ rider, onLogout }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChangePassword = async () => {
    setError(null);
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required."); return;
    }
    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters."); return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match."); return;
    }
    setLoading(true);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-[#F97316] font-bold text-xl">
            {rider?.fullName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-gray-900 font-bold">{rider?.fullName}</p>
            <p className="text-gray-400 text-xs mt-0.5">{rider?.email}</p>
            <p className="text-gray-400 text-xs">{rider?.vehicleType}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900">Change Password</h2>
        {[
          { field: "currentPassword", label: "Current Password" },
          { field: "newPassword", label: "New Password" },
          { field: "confirmPassword", label: "Confirm New Password" },
        ].map(({ field, label }) => (
          <div key={field}>
            <label className="text-xs font-semibold text-gray-500 block mb-1">{label}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form[field]}
              onChange={(e) => { setForm({ ...form, [field]: e.target.value }); setError(null); }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            />
          </div>
        ))}
        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-xs bg-green-50 border border-green-200 px-3 py-2 rounded-xl">✓ Password updated successfully.</p>
        )}
        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full py-2.5 bg-[#F97316] hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-600 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Log Out
      </button>
    </div>
  );
}