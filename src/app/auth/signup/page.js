// app/auth/signup/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Loader2, Mail, Phone, User as UserIcon, Navigation, ArrowLeft, ArrowRight } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
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
        body: JSON.stringify({ email: formData.email }),
      });
      const json = await res.json();

      if (json.success) {
        if (json.isExistingUser) {
          setError("Account already exists with this email. Please sign in instead.");
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
        router.push("/account");
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError("Registration verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4 text-zinc-900">
      <div className="w-full max-w-lg bg-white border border-zinc-200/80 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h1 className="text-base font-extrabold uppercase tracking-widest text-zinc-900">
            {step === 1 ? "Create Account" : "Verify Your Email"}
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
              <label className="block text-[11px] font-bold text-zinc-500 mb-1.5">Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-900 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1.5">Gmail Address (@gmail.com) *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-900 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1.5">Mobile Number (10 Digits) *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="tel"
                  required
                  maxLength="10"
                  value={formData.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, mobile: val });
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-zinc-900 focus:border-yellow-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold text-zinc-500">Delivery Address *</label>
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={locating}
                  className="flex items-center gap-1 text-[11px] text-yellow-600 font-bold hover:underline cursor-pointer"
                >
                  {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3 text-yellow-500" />}
                  <span>Fetch Live Location</span>
                </button>
              </div>
              <textarea
                required
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-900 focus:border-yellow-400 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1.5">Pincode *</label>
              <input
                type="text"
                required
                maxLength="6"
                value={formData.pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setFormData({ ...formData, pincode: val });
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-900 focus:border-yellow-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Get OTP & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-zinc-500 pt-2">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-yellow-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 mb-1.5">
                Enter 6-digit OTP sent to {formData.email} *
              </label>
              <input
                type="text"
                required
                maxLength="6"
                value={formData.otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setFormData({ ...formData, otp: val });
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-xs text-zinc-900 tracking-widest text-center focus:border-yellow-400 focus:outline-none font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Verify & Create Account</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
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