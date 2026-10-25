"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Mail, Lock, KeyRound, ArrowRight, RefreshCw } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Credentials Input, 2: OTP Input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isCredentialsValid = email.trim() !== "" && password.trim() !== "";

  // Step 1: Verify Credentials against MongoDB & Trigger OTP
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!isCredentialsValid) return;

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setStep(2);
        setSuccessMsg("Credentials verified successfully! OTP sent to your email.");
      } else {
        setError(data?.error || "Invalid credentials. Please check your email or password.");
      }
    } catch (err) {
      console.error("Credentials submit error:", err);
      setError("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Route Based on DB Role using Hard Redirection
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        const role = data.role ? String(data.role).toLowerCase().trim() : "";

        if (role === "admin") {
          window.location.href = "/admin/dashboard";
        } else if (role === "delivery") {
          window.location.href = "/delivery";
        } else {
          window.location.href = "/";
        }
      } else {
        setError(data?.error || "Invalid or expired OTP.");
        setLoading(false);
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Network error during verification. Please check your connection.");
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setSuccessMsg("A new OTP has been sent.");
      } else {
        setError(data?.error || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#121212] rounded-3xl border border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider text-amber-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Restricted Staff Portal</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {step === 1 ? "Admin & Staff Login" : "Enter Security OTP"}
          </h1>
          <p className="text-xs text-neutral-400">
            {step === 1 ? "Provide your database staff credentials" : `OTP sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs font-semibold text-center leading-relaxed">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="p-4 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-semibold text-center">
            {successMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Staff Email</span>
              </label>
              <input
                type="email"
                placeholder="admin@caseo.in"
                value={email}
                onChange={(e) => { 
                  setEmail(e.target.value); 
                  setError(""); 
                }}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { 
                  setPassword(e.target.value); 
                  setError(""); 
                }}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !isCredentialsValid}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold py-3.5 rounded-xl text-xs transition-all shadow-lg cursor-pointer mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-neutral-950" /> : <><span>Verify Credentials & Send OTP</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Enter 6-Digit OTP</span>
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setError(""); }}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-lg font-bold font-mono text-white tracking-[0.5em] text-center focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-neutral-950" /> : <span>Verify & Access Dashboard</span>}
            </button>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-800/80">
              <button type="button" onClick={() => { setStep(1); setOtp(""); setError(""); }} className="hover:text-amber-400 cursor-pointer">
                ← Back to Credentials
              </button>
              <button type="button" onClick={handleResendOtp} disabled={resending} className="flex items-center gap-1 hover:text-amber-400 cursor-pointer disabled:opacity-50">
                <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                <span>{resending ? "Sending..." : "Resend OTP"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}