// app/auth/signin/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, ArrowRight, UserPlus, X } from "lucide-react";

export default function SignInPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Custom Modal State for New User Detection
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.endsWith("@gmail.com")) {
      setError("Only @gmail.com email addresses are valid.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Explicitly passing mode: 'login' to trigger DB verification before OTP creation
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mode: "login" }),
      });
      
      const json = await res.json();

      if (json.success) {
        setStep(2);
      } else {
        // If DB indicates user doesn't exist (404 / isExistingUser: false)
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

  const handleVerifyAndLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        setError(json.error || "Invalid or expired OTP.");
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
              <h3 className="text-base font-extrabold text-zinc-900">Account Not Found</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                No account is associated with <span className="font-bold text-zinc-800">{email}</span>. Please sign up to create a new account.
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

      {/* Main Sign In Form Card */}
      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h1 className="text-base font-extrabold uppercase tracking-widest text-zinc-900">
            {step === 1 ? "Sign In to Account" : "Enter Verification OTP"}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1.5">Gmail Address (@gmail.com)</label>
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-900 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Get OTP & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-zinc-500 pt-2">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-amber-600 font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1.5">Enter 6-digit OTP sent to {email}</label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(val);
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-900 tracking-[0.5em] text-center font-bold focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Verify & Access Account</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}