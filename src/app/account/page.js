// app/account/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone, MapPin, Hash, LogOut, Edit3, Save, X, Sparkles, UserCheck, ShieldCheck } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    pincode: "",
    address: ""
  });

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const json = await res.json();

        if (json.success) {
          setUser(json.user);
          setFormData({
            name: json.user.name || "",
            mobile: json.user.mobile || "",
            pincode: json.user.pincode || "",
            address: json.user.address || ""
          });
        } else {
          router.push("/auth/signin");
        }
      } catch (err) {
        router.push("/auth/signin");
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/auth/signin");
    } catch (err) {
      setError("Failed to log out.");
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const json = await res.json();

      if (json.success) {
        setUser(json.user);
        setIsEditing(false);
        setSuccessMsg("Profile synced & updated successfully! ✨");
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        setError(json.error || "Failed to update profile.");
      }
    } catch (err) {
      setError("Something went wrong while updating.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-neutral-900 px-4 py-12 pb-28 flex items-center justify-center selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xl shadow-amber-500/5 relative overflow-hidden">
        
        {/* Top Decorative Vibe Badge */}
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-neutral-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-2">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Verified Profile</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900">My Account</h1>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">Your personal drop details & shipping profile</p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || "",
                    mobile: user.mobile || "",
                    pincode: user.pincode || "",
                    address: user.address || ""
                  });
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-2xl transition-all border border-neutral-200 active:scale-95 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl transition-all border border-rose-200 active:scale-95 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {user && !isEditing && (
          /* --- VIEW MODE --- */
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-black text-neutral-900 truncate">{user.name}</h2>
                  <UserCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                </div>
                <p className="text-xs text-neutral-500 truncate font-mono mt-0.5">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Mobile Number</span>
                </div>
                <p className="text-xs font-bold text-neutral-900 font-mono">{user.mobile || "Not added"}</p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Hash className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Pincode</span>
                </div>
                <p className="text-xs font-bold text-neutral-900 font-mono">{user.pincode || "Not added"}</p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Delivery Address</span>
              </div>
              <p className="text-xs font-semibold text-neutral-900 leading-relaxed">{user.address || "Not added"}</p>
            </div>
          </div>
        )}

        {user && isEditing && (
          /* --- EDIT MODE FORM --- */
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800">Mobile Number</label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  required
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800">Delivery Address</label>
              <textarea
                rows="3"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold py-3.5 rounded-2xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer mt-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Save className="w-4 h-4 stroke-[2.5]" />}
              <span>{saving ? "Syncing Profile..." : "Save Changes"}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}