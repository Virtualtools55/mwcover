// app/auth/signin/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.endsWith("@gmail.com")) {
      setError("Only @gmail.com email addresses are valid.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();

      if (json.success) {
        if (!json.isExistingUser) {
          setError("No account found with this email! Please use the Sign Up page.");
          return;
        }
        setStep(2);
      } else {
        setError(json.error);
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
        router.push("/account");
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError("Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h1 className="text-base font-extrabold uppercase tracking-widest">
            {step === 1 ? "Sign In to Account" : "Enter Verification OTP"}
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1.5">Gmail Address (@gmail.com)</label>
              <input
                type="email"
                required
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-4 py-3 text-xs text-white focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Get OTP & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-neutral-400 pt-2">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-yellow-400 font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1.5">Enter 6-digit OTP sent to {email}</label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-4 py-3 text-xs text-white tracking-widest text-center focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
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