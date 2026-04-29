import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const BASE_URL = "https://biteswift-qw3s.onrender.com";

const IconEye = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconCheck = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconLock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function SetupPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying");
  const [riderName, setRiderName] = useState("");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    const verify = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/auth/rider/verify-token/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setRiderName(data.fullName);
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    };
    verify();
  }, [token]);

  const getStrength = (password) => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };

  const strength = getStrength(form.password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"][strength];

  const validate = () => {
    const e = {};
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/rider/setup-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus("success");
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Verifying your link...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-red-500 text-2xl">✕</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Link Invalid or Expired</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            This setup link is invalid or has expired. Contact BiteSwift to get a new one.
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 text-green-500">
            <IconCheck size={32} />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">You're all set! 🛵</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your rider account is ready. Log in to access your dashboard and start accepting deliveries.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">BiteSwift</span>
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Set your password</h1>
            <p className="text-gray-500 text-sm">
              Welcome, <span className="text-orange-500 font-semibold">{riderName}</span>! Create a secure password to access your rider dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><IconLock size={16} /></div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className={`w-full pl-10 pr-12 py-3.5 rounded-xl border text-gray-900 text-sm placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Strength: <span className="font-medium text-gray-600">{strengthLabel}</span></p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><IconLock size={16} /></div>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-12 py-3.5 rounded-xl border text-gray-900 text-sm placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {errors.general && (
              <p className="text-red-500 text-sm text-center bg-red-50 py-3 rounded-xl border border-red-100">{errors.general}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-xl transition-all text-sm shadow-lg shadow-orange-200"
            >
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Setting up your account...</>
                : "Set Password & Go to Dashboard"
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}