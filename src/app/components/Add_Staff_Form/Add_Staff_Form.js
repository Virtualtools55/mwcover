"use client";

import { useState } from "react";
import { 
  UserPlus, 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ShieldCheck, 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Send,
  Sparkles
} from "lucide-react";

export default function ProvisionAgentForm({ onAgentCreated }) {
  const [step, setStep] = useState(1); // 1: Details Input & Send OTP, 2: OTP Verification & Creation
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "delivery"
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 1: Send OTP to Agent's Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/staff/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: formData.email.trim().toLowerCase()
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep(2);
        setSuccess(`Verification OTP sent to ${formData.email.trim().toLowerCase()}`);
      } else {
        setError(data.error || "Failed to send OTP. Please check the email.");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      setError("Network error while sending OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Create Staff Account in MongoDB
  const handleVerifyAndCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/staff/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          email: formData.email.trim().toLowerCase(),
          otp: otp.trim()
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(`Successfully created ${formData.role.toUpperCase()} account for ${formData.email}!`);
        setFormData({ name: "", email: "", mobile: "", password: "", role: "delivery" });
        setOtp("");
        setStep(1);
        if (onAgentCreated) onAgentCreated();
      } else {
        setError(data.error || "Invalid or expired OTP code.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Network error during verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#121212] border border-neutral-800/80 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300">
      
      {/* Subtle Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-2xl shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
              {step === 1 ? "Provision Staff Account" : "Verify Email OTP"}
            </h2>
            <p className="text-[11px] text-neutral-400">
              {step === 1 ? "Onboard new Admin or Delivery Agent" : `OTP sent to ${formData.email}`}
            </p>
          </div>
        </div>

        {/* Step Indicator Badge */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono font-semibold text-amber-400 shrink-0">
          Step {step} of 2
        </span>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800/80 text-rose-300 rounded-2xl text-xs font-medium flex items-center gap-2.5 leading-relaxed animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 rounded-2xl text-xs font-medium flex items-center gap-2.5 leading-relaxed animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form Steps */}
      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Staff Email Address</span>
              </label>
              <input
                type="email"
                placeholder="agent@caseo.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Mobile Number</span>
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Assign Portal Role</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all cursor-pointer"
              >
                <option value="delivery">Delivery Agent</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[11px] font-semibold text-neutral-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Temporary Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-400/10 mt-6 active:scale-[0.99]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Verification OTP</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndCreate} className="space-y-5">
          <div className="space-y-2 text-center py-2">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Enter 6-Digit OTP Code</span>
            </label>
            <input
              type="text"
              maxLength="6"
              placeholder="123456"
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(""); }}
              required
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl px-4 py-3.5 text-xl font-bold font-mono text-white tracking-[0.5em] sm:tracking-[0.7em] text-center focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
            />
            <p className="text-[11px] text-neutral-400">
              Check inbox of <span className="font-mono text-amber-400">{formData.email}</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.trim().length < 6}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-[0.99]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Verify OTP & Create Staff Access</span>
              </>
            )}
          </button>

          <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => { setStep(1); setOtp(""); setError(""); }}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Edit Details</span>
            </button>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="text-[11px] text-neutral-400 hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              Resend OTP
            </button>
          </div>
        </form>
      )}
    </div>
  );
}