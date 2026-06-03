import { useState, useEffect } from "react";
import api from "../services/api";

const IconWallet = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
);

const IconBank = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="10" width="18" height="11"/><path d="M3 7l9-4 9 4"/><line x1="12" y1="10" x2="12" y2="21"/>
  </svg>
);

const IconArrowDown = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
  </svg>
);

const IconArrowUp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>
);

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconAlert = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconLoader = () => (
  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
);

const BASE_URL = "https://biteswift-qw3s.onrender.com";

function BankDetailsForm({ profile, onSaved }) {
  const [banks, setBanks] = useState([]);
  const [bankSearch, setBankSearch] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [form, setForm] = useState({
    bankCode: profile?.bankCode || "",
    bankName: profile?.bankName || "",
    bankAccountNumber: profile?.bankAccountNumber || "",
    accountName: profile?.accountName || "",
  });
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/wallet/banks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("riderToken")}` },
        });
        const json = await res.json();
        setBanks(json.data || []);
      } catch { console.error("Could not load banks"); }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        bankCode: profile.bankCode || "",
        bankName: profile.bankName || "",
        bankAccountNumber: profile.bankAccountNumber || "",
        accountName: profile.accountName || "",
      });
    }
  }, [profile]);

  const filteredBanks = banks.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const resolveAccount = async (accountNumber, bankCode) => {
    if (accountNumber.length !== 10 || !bankCode) return;
    setResolving(true);
    setError(null);
    try {
      const res = await fetch(
        `${BASE_URL}/api/wallet/resolve-account?account_number=${accountNumber}&bank_code=${bankCode}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("riderToken")}` } }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setForm(prev => ({ ...prev, accountName: json.data.account_name }));
    } catch {
      setError("Could not verify account. Check the details and try again.");
      setForm(prev => ({ ...prev, accountName: "" }));
    } finally {
      setResolving(false);
    }
  };

  const handleBankSelect = (bank) => {
    setForm(prev => ({ ...prev, bankCode: bank.code, bankName: bank.name, accountName: "" }));
    setBankSearch("");
    setShowBankDropdown(false);
    if (form.bankAccountNumber.length === 10) {
      resolveAccount(form.bankAccountNumber, bank.code);
    }
  };

  const handleAccountNumberChange = (value) => {
    setForm(prev => ({ ...prev, bankAccountNumber: value, accountName: "" }));
    if (value.length === 10 && form.bankCode) {
      resolveAccount(value, form.bankCode);
    }
  };

  const handleSave = async () => {
    if (!form.bankCode || !form.bankAccountNumber || !form.accountName) {
      setError("Please complete all fields and verify your account.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/rider/bank-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("riderToken")}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved(form);
    } catch (err) {
      setError(err.message || "Failed to save bank details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
      <h2 className="text-sm font-bold text-gray-900">Bank Details</h2>
      <p className="text-xs text-gray-400">Add your bank account so you can withdraw your earnings.</p>

      {form.bankAccountNumber && form.bankCode && form.accountName && (
        <div className="bg-green-50 border border-green-200 text-green-600 text-xs px-3 py-2.5 rounded-xl">
          ✓ Bank account linked — {form.bankName} •••• {form.bankAccountNumber.slice(-4)}
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Select Bank</label>
        <div className="relative">
          <input
            type="text"
            placeholder={form.bankName || "Search for your bank..."}
            value={form.bankCode ? form.bankName : bankSearch}
            onChange={(e) => {
              setBankSearch(e.target.value);
              setShowBankDropdown(true);
              if (form.bankCode) {
                setForm(prev => ({ ...prev, bankCode: "", bankName: "", accountName: "" }));
              }
            }}
            onFocus={() => setShowBankDropdown(true)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
          />
          {showBankDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowBankDropdown(false)} />
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg max-h-52 overflow-y-auto">
                {filteredBanks.length === 0 ? (
                  <p className="text-xs text-gray-400 px-4 py-3">No banks found</p>
                ) : (
                  filteredBanks.map(bank => (
                    <button
                      key={bank.code}
                      onClick={() => handleBankSelect(bank)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {bank.name}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
        {form.bankName && (
          <p className="text-xs text-orange-500 mt-1">✓ {form.bankName} selected</p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Account Number</label>
        <input
          type="text"
          maxLength={10}
          placeholder="Enter 10-digit account number"
          value={form.bankAccountNumber}
          onChange={(e) => handleAccountNumberChange(e.target.value.replace(/\D/g, ""))}
          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Account Name</label>
        <div className="relative">
          <input
            type="text"
            readOnly
            placeholder={resolving ? "Verifying..." : "Auto-filled after account number"}
            value={form.accountName}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 focus:outline-none"
          />
          {resolving && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          )}
        </div>
        {form.accountName && !resolving && (
          <p className="text-xs text-green-600 mt-1">✓ Verified — {form.accountName}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 text-xs px-3 py-2.5 rounded-xl">{error}</div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || resolving || !form.accountName}
        className="w-full py-2.5 bg-[#F97316] text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? <><IconLoader />Saving...</> : saved ? "Saved!" : "Save Bank Details"}
      </button>
    </div>
  );
}

function WithdrawModal({ balance, profile, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const bankName = profile?.bankName;
  const accountNumber = profile?.bankAccountNumber;
  const accountName = profile?.accountName;
  const bankCode = profile?.bankCode;
  const hasBankInfo = !!(bankName && bankCode && accountNumber);

  const handleWithdraw = async () => {
    setError(null);
    const amt = Number(amount);
    if (!amt || amt < 200) { setError("Minimum withdrawal amount is ₦200."); return; }
    if (amt > balance) { setError("Amount exceeds your available balance."); return; }
    if (!hasBankInfo) {
      setError("No bank account linked. Please add your bank details first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/wallet/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("riderToken")}`,
        },
        body: JSON.stringify({ amount: amt, bankAccount: accountNumber, bankCode, accountName, bankName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Withdrawal failed.");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Withdrawal failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 text-sm">Withdraw Earnings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IconX /></button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs text-gray-400 mb-0.5">Available Balance</p>
            <p className="text-xl font-bold text-gray-900">₦{Number(balance).toLocaleString()}</p>
          </div>

          {hasBankInfo ? (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-4">
              <div className="text-orange-500 shrink-0"><IconBank /></div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{bankName} •••• {accountNumber?.slice(-4)}</p>
                <p className="text-xs text-gray-400">{accountName}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <span className="text-red-400 shrink-0"><IconAlert /></span>
              <p className="text-xs text-red-500">No bank account linked. Add your bank details below first.</p>
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 block mb-1">Amount (₦)</label>
            <input
              type="number"
              placeholder="e.g. 2000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            />
            <p className="text-xs text-gray-300 mt-1">Minimum: ₦200 · Withdrawals processed next business day</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 text-xs px-3 py-2.5 rounded-xl mb-4">{error}</div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-400 font-semibold hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={loading || !hasBankInfo}
              className="flex-1 py-2.5 bg-[#F97316] text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><IconLoader />Processing...</> : "Withdraw"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function RiderWalletPage({ rider }) {
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const fetchWallet = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/wallet/rider`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("riderToken")}` },
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setWalletData(json.data ?? json);
      const rawTransactions = (json.data ?? json).transactions || [];
      setTransactions([...rawTransactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      setError("Could not load wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/rider/profile");
      setProfile(res.data.data);
    } catch {
      console.error("Could not load rider profile for wallet");
    }
  };

  const refreshAll = () => { fetchWallet(); fetchProfile(); };
  useEffect(() => { refreshAll(); }, []);

  const balance = Number(walletData?.balance ?? rider?.walletBalance ?? 0);
  const totalEarnings = Number(rider?.totalEarnings ?? 0);
  const totalDeliveries = transactions.filter(t => t.type === "credit").length;

  return (
    <div className="space-y-4">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-500 text-sm px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchWallet} className="font-semibold underline ml-4 text-xs">Retry</button>
        </div>
      )}

      {/* Balance Card — orange gradient stays */}
      <div className="bg-gradient-to-br from-[#F97316] to-[#ea580c] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white/70"><IconWallet /></span>
            <span className="text-sm text-white/70">Available Balance</span>
          </div>
          {loading
            ? <div className="h-9 bg-white/20 rounded-xl w-40 animate-pulse mb-4" />
            : <p className="text-3xl font-bold mb-4">₦{balance.toLocaleString()}</p>
          }
          <p className="text-xs text-white/60 mb-5">
            You earn your cut when you mark an order as delivered.
            Withdraw anytime to your bank.
          </p>
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={loading || balance === 0}
            className="bg-white text-[#F97316] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total Earned</p>
          {loading
            ? <div className="h-6 bg-gray-100 rounded-lg w-24 animate-pulse" />
            : <p className="text-lg font-bold text-gray-900">₦{totalEarnings.toLocaleString()}</p>
          }
          <p className="text-xs text-gray-300 mt-0.5">All time</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Completed Deliveries</p>
          {loading
            ? <div className="h-6 bg-gray-100 rounded-lg w-16 animate-pulse" />
            : <p className="text-lg font-bold text-gray-900">{totalDeliveries}</p>
          }
          <p className="text-xs text-gray-300 mt-0.5">Earned from deliveries</p>
        </div>
      </div>

      <BankDetailsForm
        profile={profile}
        onSaved={(bankData) => setProfile(prev => ({ ...prev, ...bankData }))}
      />

      {/* Transaction History */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Transaction History</h2>
          <button onClick={refreshAll} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Refresh</button>
        </div>

        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse border-b border-gray-100 last:border-0">
              <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-20" />
            </div>
          ))
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-400 text-sm">No transactions yet</p>
            <p className="text-gray-300 text-xs mt-1">Complete deliveries to start earning</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((t, i) => {
              const isCredit = t.type === "credit";
              const amount = Number(t.amount || 0);
              const label = t.description || t.narration || "Transaction";
              const date = t.createdAt
                ? new Date(t.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
                : "";
              const time = t.createdAt
                ? new Date(t.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
                : "";
              const statusColor = t.status === "pending"
                ? "text-yellow-500"
                : t.status === "failed"
                ? "text-red-500"
                : isCredit || t.status === "success"
                ? "text-green-600"
                : "text-red-500";

              return (
                <div key={t._id || t.reference || i} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isCredit || t.status === "success" ? "bg-green-50" : "bg-red-50"}`}>
                      {isCredit || t.status === "success"
                        ? <span className="text-green-500"><IconArrowDown /></span>
                        : <span className="text-red-500"><IconArrowUp /></span>
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-400">{date}{time ? ` · ${time}` : ""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${statusColor}`}>
                      {isCredit ? "+" : "-"}₦{amount.toLocaleString()}
                    </p>
                    {t.status === "pending" && (
                      <p className="text-xs text-yellow-500/70 mt-0.5">Pending</p>
                    )}
                    {t.status === "failed" && (
                      <p className="text-xs text-red-400 mt-0.5">Failed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showWithdraw && (
        <WithdrawModal
          balance={balance}
          profile={profile}
          onClose={() => setShowWithdraw(false)}
          onSuccess={refreshAll}
        />
      )}
    </div>
  );
}