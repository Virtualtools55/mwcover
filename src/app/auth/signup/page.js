// app/auth/signup/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, MapPin, ShieldCheck, Mail, Phone, User as UserIcon, Navigation } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    address: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.endsWith("@gmail.com")) {
      setError("Only @gmail.com email addresses are permitted.");
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

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, ...formData }),
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
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-neutral-200 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
          <div>
            <h1 className="text-lg font-black tracking-tight text-neutral-900">Create Account</h1>
            <p className="text-xs text-neutral-500 font-medium">Join us with your @gmail.com address</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 flex items-center justify-center text-yellow-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Gmail Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Continue with OTP</span>
            </button>

            <p className="text-center text-xs text-neutral-500 pt-3">
              Already have an account?{" "}
              <Link href="/auth/signIn" className="text-neutral-900 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Enter 6-digit OTP sent to {email}</label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs text-neutral-900 tracking-widest text-center font-bold focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="Ankit Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl pl-11 pr-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-neutral-700">Delivery Address</label>
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={locating}
                  className="flex items-center gap-1 text-[11px] text-neutral-900 font-bold hover:underline cursor-pointer"
                >
                  {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3 text-yellow-500" />}
                  <span>Fetch Live Location</span>
                </button>
              </div>
              <textarea
                required
                rows="2"
                placeholder="House No, Street, Landmark, City"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-medium resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">Pincode</label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="110001"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Verify OTP & Create Account</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}