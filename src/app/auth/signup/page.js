
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  Sparkles,
  Loader2,
  Mail,
  Phone,
  User as UserIcon,
  Navigation,
  ArrowLeft,
  ArrowRight,
  MapPin,
  Hash,
} from "lucide-react";

// ==========================================
// INPUT VALIDATION HELPERS
// ==========================================

// Full name: Unicode letters, spaces, periods,
// apostrophes and hyphens.
const NAME_ALLOWED_REGEX = /^[\p{L}\p{M} .'-]*$/u;

const NAME_VALIDATION_REGEX =
  /^[\p{L}][\p{L}\p{M}]*(?:[ .'-][\p{L}][\p{L}\p{M}]*)*$/u;

const validateName = (name) => {
  const value = name.trim();

  return (
    value.length >= 2 &&
    value.length <= 60 &&
    NAME_VALIDATION_REGEX.test(value)
  );
};

// Remove unsupported characters from name input.
const sanitizeName = (value) => {
  return value
    .replace(/[^\p{L}\p{M} .'-]/gu, "")
    .slice(0, 60);
};

function SignUpContent() {
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

  // ==========================================
  // PREFILL EMAIL
  // ==========================================

  useEffect(() => {
    if (emailParam) {
      setFormData((prev) => ({
        ...prev,
        email: emailParam.slice(0, 254),
      }));
    }
  }, [emailParam]);

  // ==========================================
  // FULL NAME INPUT
  // ==========================================

  const handleNameChange = (e) => {
    const originalValue = e.target.value;
    const cleanValue = sanitizeName(originalValue);

    if (originalValue !== cleanValue) {
      setError(
        "Name can contain letters, spaces, hyphens, apostrophes and periods only."
      );
    } else {
      setError("");
    }

    setFormData((prev) => ({
      ...prev,
      name: cleanValue,
    }));
  };

  // ==========================================
  // FETCH LIVE LOCATION
  // ==========================================

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
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

          if (!res.ok) {
            throw new Error("Location service failed.");
          }

          const data = await res.json();

          if (data && data.address) {
            const fullAddress = String(data.display_name || "").slice(
              0,
              300
            );

            const pincodeMatch = fullAddress.match(/\b\d{6}\b/);

            setFormData((prev) => ({
              ...prev,
              address: fullAddress,
              pincode: pincodeMatch
                ? pincodeMatch[0]
                : prev.pincode,
            }));
          }
        } catch (err) {
          setError("Failed to fetch address details.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setError("Unable to retrieve location. Please fill manually.");
        setLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const mobile = formData.mobile;
    const address = formData.address.trim();
    const pincode = formData.pincode;

    // Validate name
    if (!validateName(name)) {
      setError("Please enter a valid full name.");
      return;
    }

    // Validate email
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      setError("Only @gmail.com email addresses are permitted.");
      return;
    }

    // Validate mobile
    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Validate address
    if (!address || address.length > 300) {
      setError("Please enter a valid delivery address.");
      return;
    }

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          mode: "signup",
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to send OTP.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        name,
        email,
        address,
      }));

      setStep(2);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP AND REGISTER
  // ==========================================

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const address = formData.address.trim();

    // Validate name again
    if (!validateName(name)) {
      setError("Invalid full name. Please go back and correct it.");
      setStep(1);
      return;
    }

    // Validate OTP
    if (!/^\d{6}$/.test(formData.otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    // Validate remaining fields again
    if (
      !/^\d{10}$/.test(formData.mobile) ||
      !/^\d{6}$/.test(formData.pincode) ||
      !address ||
      address.length > 300
    ) {
      setError("Please check your registration details.");
      setStep(1);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          mobile: formData.mobile,
          address,
          pincode: formData.pincode,
          otp: formData.otp,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Verification failed.");
        return;
      }

      window.location.href = "/account";
    } catch (err) {
      setError("Registration verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center items-center p-3 sm:p-6 text-zinc-900 selection:bg-amber-400 selection:text-black">

      <div className="w-full max-w-md bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all">

        {/* HEADER */}

        <div className="flex items-center gap-2 mb-5">

          <div className="p-2 bg-amber-400/20 text-amber-600 rounded-xl">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>

          <div>
            <h1 className="text-base font-extrabold uppercase tracking-widest text-zinc-900">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h1>

            <p className="text-[11px] text-zinc-400 font-medium">
              {step === 1
                ? "Enter details to get started with Caseo"
                : `OTP sent to ${formData.email}`}
            </p>
          </div>

        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium leading-relaxed"
          >
            {error}
          </div>
        )}

        {/* ================================= */}
        {/* STEP 1: USER DETAILS */}
        {/* ================================= */}

        {step === 1 ? (

          <form onSubmit={handleSendOtp} className="space-y-3.5">

            {/* FULL NAME */}

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                Full Name *
              </label>

              <div className="relative">

                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />

                <input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  maxLength={60}
                  autoComplete="name"
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none transition-all"
                />

              </div>

              <p className="text-[10px] text-zinc-400 mt-1">
                Letters, spaces, hyphens, apostrophes and periods only.
              </p>
            </div>

            {/* EMAIL */}

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                Gmail Address *
              </label>

              <div className="relative">

                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />

                <input
                  type="email"
                  name="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="rahul@gmail.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value.slice(0, 254),
                    }));
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none transition-all"
                />

              </div>
            </div>

            {/* MOBILE NUMBER */}

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                Mobile Number (10 Digits) *
              </label>

              <div className="relative">

                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />

                <input
                  type="tel"
                  name="mobile"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setFormData((prev) => ({
                      ...prev,
                      mobile: value,
                    }));
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none transition-all"
                />

              </div>
            </div>

            {/* DELIVERY ADDRESS */}

            <div>

              <div className="flex justify-between items-center mb-1">

                <label className="text-[11px] font-bold text-zinc-600">
                  Delivery Address *
                </label>

                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={locating}
                  className="flex items-center gap-1 text-[11px] text-amber-600 font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  {locating ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                  ) : (
                    <Navigation className="w-3 h-3 text-amber-500" />
                  )}

                  <span>Use Live Location</span>
                </button>

              </div>

              <div className="relative">

                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />

                <textarea
                  name="address"
                  required
                  maxLength={300}
                  rows={2}
                  autoComplete="street-address"
                  placeholder="House No, Street, Landmark..."
                  value={formData.address}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value.slice(0, 300),
                    }));
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none resize-none transition-all"
                />

              </div>
            </div>

            {/* PINCODE */}

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                Pincode (6 Digits) *
              </label>

              <div className="relative">

                <Hash className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />

                <input
                  type="text"
                  name="pincode"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="110001"
                  value={formData.pincode}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setFormData((prev) => ({
                      ...prev,
                      pincode: value,
                    }));
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/15 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 focus:outline-none transition-all"
                />

              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading || locating}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md mt-2 active:scale-95 disabled:opacity-50"
            >

              {loading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}

              <span>Get OTP & Continue</span>

              <ArrowRight className="w-4 h-4" />

            </button>

            {/* SIGN IN LINK */}

            <p className="text-center text-xs text-zinc-500 pt-1">

              Already have an account?{" "}

              <Link
                href="/auth/signin"
                className="text-amber-600 font-bold hover:underline"
              >
                Sign In
              </Link>

            </p>

          </form>

        ) : (

          /* ================================= */
          /* STEP 2: OTP VERIFICATION */
          /* ================================= */

          <form
            onSubmit={handleVerifyAndRegister}
            className="space-y-4 pt-2"
          >

            <div>

              <label className="block text-[11px] font-bold text-zinc-600 mb-1.5 text-center">
                Enter 6-digit OTP sent to email
              </label>

              <input
                type="text"
                name="otp"
                required
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={formData.otp}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                  setFormData((prev) => ({
                    ...prev,
                    otp: value,
                  }));
                }}
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-zinc-900 tracking-[0.5em] text-center font-black focus:outline-none"
              />

            </div>

            {/* VERIFY BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-zinc-950 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >

              {loading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}

              <span>Verify & Create Account</span>

            </button>

            {/* BACK BUTTON */}

            <button
              type="button"
              onClick={() => {
                setError("");
                setStep(1);
              }}
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

// ==========================================
// MAIN PAGE
// ==========================================

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center text-xs font-bold text-zinc-500">
          Loading Sign Up...
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
