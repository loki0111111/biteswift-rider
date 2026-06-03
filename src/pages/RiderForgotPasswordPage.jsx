import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://biteswift-qw3s.onrender.com";

export default function RiderForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError("Email is required."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSent(true);
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
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
              <p className="text-white/40 text-sm mb-6">If an account exists for <strong className="text-white/60">{email}</strong>, a reset link has been sent.</p>
              <button onClick={() => navigate("/login")} className="text-orange-500 hover:text-orange-400 text-sm font-semibold">
                ← Back to Login
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white mb-1">Forgot password?</h1>
              <p className="text-white/40 text-sm mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/40 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); }}
                    placeholder="e.g. emeka@gmail.com"
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
                  disabled={loading}
                  className="w-full py-3.5 bg-[#F97316] hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <p className="text-center mt-5">
                <button onClick={() => navigate("/login")} className="text-white/30 hover:text-white/60 text-xs transition-colors">
                  ← Back to Login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}