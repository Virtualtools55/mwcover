// app/account/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Phone, MapPin, Hash, LogOut } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });
        const json = await res.json();

        if (json.success) {
          setUser(json.user);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-neutral-200 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
          <div>
            <h1 className="text-xl font-black tracking-tight text-neutral-900">My Account</h1>
            <p className="text-xs text-neutral-500 font-medium">Manage your profile and delivery details</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-2xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">{user.name}</h2>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Phone className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Mobile Number</span>
                </div>
                <p className="text-xs font-bold text-neutral-900">{user.mobile}</p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="flex items-center gap-2 text-neutral-400 mb-1">
                  <Hash className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Pincode</span>
                </div>
                <p className="text-xs font-bold text-neutral-900">{user.pincode}</p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Delivery Address</span>
              </div>
              <p className="text-xs font-medium text-neutral-900 leading-relaxed">{user.address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}