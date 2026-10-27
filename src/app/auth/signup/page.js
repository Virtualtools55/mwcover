// app/auth/signup/page.jsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2, Mail, Phone, User as UserIcon, Navigation, ArrowLeft, ArrowRight, MapPin, Hash } from "lucide-react";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    pincode: "",
    otp: "",
  });

  // Pre-fill email if passed from Sign In redirect modal
  useEffect(() => {
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [emailParam]);

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.address) {
            const fullAddress = data.display_name || "";
            const pincodeMatch = fullAddress.match(/\b\d{6}\b/);
            setFormData((prev) => ({
              ...prev,
              address: fullAddress,
              pincode: pincodeMatch ? pincodeMatch[0] : prev.pincode,
            }));
          }
        } catch (err) {
          setError("Failed to fetch address details from coordinates.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setError("Unable to retrieve location. Please fill manually.");
        setLocating(false);
      }
    );
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(formData.pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!formData.email.endsWith("@gmail.com")) {
      setError("Only @gmail.com email addresses are permitted.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, mode: "signup" }),
      });
      const json = await res.json();

      if (json.success) {
        setStep(2);
      } else {
        setError(json.error || "Failed to send OTP.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        window.location.href = "/account";
      } else {
        setError(json.error || "Verification failed.");
      }
    } catch (err) {
      setError("Registration verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center items-center p-3 sm:p-6 text-zinc-900 selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">
        
        {/* Header Title */}
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-amber-400/20 text-amber-600 rounded-xl">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-base font-extrabold uppercase tracking-widest text-zinc-900">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">
              {step === 1 ? "Enter details to get started with Caseo" : `OTP sent to ${formData.email}`}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">Gmail Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="rahul@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">Mobile Number (10 Digits) *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="tel"
                  required
                  maxLength="10"
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, mobile: val });
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-zinc-600">Delivery Address *</label>
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={locating}
                  className="flex items-center gap-1 text-[11px] text-amber-600 font-bold hover:underline cursor-pointer"
                >
                  {locating ? <Loader2 className="w-3 h-3 animate-spin text-amber-500" /> : <Navigation className="w-3 h-3 text-amber-500" />}
                  <span>Use Live Location</span>
                </button>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <textarea
                  required
                  rows="2"
                  placeholder="House No, Street, Landmark..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none resize-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">Pincode (6 Digits) *</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="110001"
                  value={formData.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setFormData({ ...formData, pincode: val });
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mt-2 active:scale-95 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Get OTP & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-zinc-500 pt-1">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-amber-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1.5 text-center">
                Enter 6-digit OTP sent to email
              </label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="123456"
                value={formData.otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setFormData({ ...formData, otp: val });
                }}
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-zinc-900 tracking-[0.5em] text-center font-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Verify & Create Account</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-zinc-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Edit Details</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center text-xs font-bold text-zinc-500">
        Loading Sign Up...
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}