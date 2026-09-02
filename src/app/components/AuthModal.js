"use client";

import { useState } from "react";
import { X, MapPin, Loader2, Sparkles, ShieldCheck } from "lucide-react";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP / Details
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isExisting, setIsExisting] = useState(false);
  const [formData, setFormData] = useState({ name: "", mobile: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

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
        setIsExisting(json.isExistingUser);
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

  const handleVerifyAndSubmit = async (e) => {
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
        onSuccess(json.user);
        onClose();
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        setFormData(prev => ({ ...prev, address: data.display_name || `${latitude}, ${longitude}` }));
      } catch (e) {
        setFormData(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
      } finally {
        setLocating(false);
      }
    }, () => setLocating(false));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-white shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <h3 className="text-sm font-extrabold uppercase tracking-widest">
            {step === 1 ? "Sign In / Register" : "Verify OTP Code"}
          </h3>
        </div>

        {error && <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">Gmail Address (@gmail.com)</label>
              <input
                type="email"
                required
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Get OTP</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyAndSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">Enter 6-digit OTP sent to {email}</label>
              <input
                type="text"
                required
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white tracking-widest text-center focus:border-yellow-400 focus:outline-none"
              />
            </div>

            {!isExisting && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold text-neutral-400">Address</label>
                    <button type="button" onClick={handleFetchLocation} className="text-[10px] text-yellow-400 flex items-center gap-1 font-bold">
                      {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />} Fetch Location
                    </button>
                  </div>
                  <textarea
                    required
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white resize-none focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Verify & Proceed</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}