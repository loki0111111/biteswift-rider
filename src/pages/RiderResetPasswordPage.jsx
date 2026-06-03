import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BASE_URL = "https://biteswift-qw3s.onrender.com";

export default function RiderResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold text-white">BiteSwift</span>
          </div>
          <p className="text-white/40 text-sm mt-2">Rider Portal</p>
        </div>

        <div className="bg-gray-50 border border-white/10 rounded-2xl p-7">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Password reset!</h2>
              <p className="text-white/40 text-sm">Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white mb-1">Set new password</h1>
              <p className="text-white/40 text-sm mb-6">Enter your new password below.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/40 mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(null); }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/40 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={form.confirm}
                    onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setError(null); }}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-3.5 bg-[#F97316] hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}