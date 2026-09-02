"use client";

import { useState } from "react";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function AdminAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const endpoint = isLogin ? "/api/admin/login" : "/api/admin/signup";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(data.message || "Success!");
        if (isLogin) {
          // Redirect or change state to admin dashboard post-login
          window.location.href = "/admin/dashboard"; // update route as needed
        }
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-neutral-100">
        
        {/* Toggle Tabs */}
        <div className="flex bg-neutral-100 p-1 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setMessage(""); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${isLogin ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setMessage(""); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${!isLogin ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"}`}
          >
            Sign Up
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">
            {isLogin ? "Admin Portal" : "Create Admin Account"}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {isLogin ? "Enter your credentials to manage your store." : "Set up your secure store administrator account."}
          </p>
        </div>

        {message && (
          <div className={`p-3 mb-6 rounded-xl text-xs font-medium ${message.includes("success") || message.includes("successful") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@store.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-neutral-900/10"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? "Sign In" : "Register Admin"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}