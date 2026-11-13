"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  UserPlus,
  X,
  RefreshCw,
  Pencil,
  CheckCircle2,
} from "lucide-react";

export default function SignInPage() {
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Resend Timer State
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Custom Modal State for New User Detection
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Countdown timer effect for Resend OTP
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith("@gmail.com")) {
      setError("Only @gmail.com email addresses are valid.");
      return;
    }

    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, mode: "login" }),
      });

      const json = await res.json();

      if (json.success) {
        setEmail(cleanEmail);
        setOtpSent(true);
        setTimer(60);
        setCanResend(false);
        setInfoMessage(json.message || "OTP sent to your Gmail.");
      } else {
        if (res.status === 404 || json.isExistingUser === false) {
          setShowSignupModal(true);
        } else {
          setError(json.error || "Failed to send OTP.");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setInfoMessage("");
    setTimer(60);
    setCanResend(false);
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mode: "login" }),
      });

      const json = await res.json();

      if (json.success) {
        setTimer(60);
        setCanResend(false);
        setInfoMessage(json.message || "New OTP sent successfully.");
      } else {
        setError(json.error || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Network error while resending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndLogin = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const json = await res.json();

      if (json.success) {
        window.location.href = "/account";
      } else {
        setError(json.error || "Wrong otp.");
      }
    } catch (err) {
      setError("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4 text-zinc-900 selection:bg-amber-400 selection:text-black relative">
      {/* Custom Caseo Theme Signup Prompt Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 relative">
            <button
              onClick={() => setShowSignupModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 p-1 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-600 flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-extrabold text-zinc-900">
                Account Not Found
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                No account is associated with{" "}
                <span className="font-bold text-zinc-800">{email}</span>. Please
                sign up to create a new account.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSignupModal(false)}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl text-xs transition-all border border-zinc-200 cursor-pointer"
              >
                Try Another Email
              </button>

              <Link
                href={`/auth/signup?email=${encodeURIComponent(email)}`}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md text-center flex items-center justify-center gap-1 cursor-pointer active:scale-95"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Unified Sign In Form Card */}
      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h1 className="text-base font-extrabold uppercase tracking-widest text-zinc-900">
            Sign In to Account
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {infoMessage && !error && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{infoMessage}</span>
          </div>
        )}

        <form
          onSubmit={otpSent ? handleVerifyAndLogin : handleSendOtp}
          className="space-y-4"
        >
          {/* Email Field (Always visible, lockable with Edit button once OTP is sent) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold text-zinc-500">
                Gmail Address (@gmail.com)
              </label>
              {otpSent && (
                <button
                  type="button"
                  onClick={handleEditEmail}
                  disabled={loading}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit Email</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="email"
                required
                readOnly={otpSent}
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border rounded-2xl px-4 py-3 text-xs transition-colors focus:outline-none ${
                  otpSent
                    ? "bg-zinc-100/80 border-zinc-200 text-zinc-600 font-semibold cursor-not-allowed pr-16"
                    : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-amber-400"
                }`}
              />
              {otpSent && (
                <button
                  type="button"
                  onClick={handleEditEmail}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold bg-white border border-zinc-200 hover:border-amber-400 text-zinc-700 hover:text-amber-600 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* OTP Input Field (Appears smoothly inside the same container after email submission) */}
          {otpSent && (
            <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1.5">
                  Enter 6-Digit Verification OTP
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength="6"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(val);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm text-zinc-900 tracking-[0.5em] text-center font-extrabold focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Resend OTP Section with 1-Minute Cooldown */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-zinc-500">Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                  className={`font-bold flex items-center gap-1 transition-colors ${
                    canResend
                      ? "text-amber-600 hover:underline cursor-pointer"
                      : "text-zinc-400 cursor-not-allowed"
                  }`}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                  <span>
                    {canResend ? "Resend OTP" : `Resend in ${timer}s`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.99]"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {otpSent ? "Verify & Access Account" : "Get OTP & Sign In"}
            </span>
            {!otpSent && <ArrowRight className="w-4 h-4" />}
          </button>

          {!otpSent && (
            <p className="text-center text-xs text-zinc-500 pt-2">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-amber-600 font-bold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}