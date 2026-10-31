// app/orders/page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Clock, ArrowLeft, PackageCheck, Ban, RefreshCw, CheckCircle2 as CheckDone, Package, Sparkles, AlertTriangle } from "lucide-react";
import Link from "next/link";

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isSuccessParam = searchParams.get("success");
  const isFailedParam = searchParams.get("failed");

  const [showSuccessBanner, setShowSuccessBanner] = useState(Boolean(isSuccessParam));
  const [showFailedBanner, setShowFailedBanner] = useState(Boolean(isFailedParam));

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [confirmModal, setConfirmModal] = useState({ show: false, orderId: null });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/list", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setOrders(json.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Optional: Poll orders every 10 seconds to check if webhook updated status to "Refunded"
    const pollInterval = setInterval(fetchOrders, 10000);
    return () => clearInterval(pollInterval);
  }, []);

  const handleConfirmCancel = async () => {
    const orderId = confirmModal.orderId;
    setConfirmModal({ show: false, orderId: null });
    if (!orderId) return;

    setActionLoading(orderId);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        showToast(`✨ ${json.message}`, "success");
        fetchOrders();
      } else {
        showToast(`⚠️ ${json.error || "Failed to cancel order."}`, "error");
      }
    } catch (err) {
      showToast("❌ Failed to process cancellation request.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center text-stone-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 py-8 px-4 sm:px-6 lg:px-8 selection:bg-amber-400 selection:text-black relative">
      
      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-neutral-900">Cancel This Order?</h3>
              <p className="text-xs text-neutral-500 leading-relaxed font-medium">
                Are you sure you want to cancel this order? Your refund will be processed back to your original payment method.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ show: false, orderId: null })}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-xs transition-all border cursor-pointer"
              >
                No, Keep It
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`fixed top-6 right-6 z-50 transition-all duration-300 transform ${toast.show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold max-w-sm w-[90vw] ${toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-neutral-900 border-amber-400/50 text-white"}`}>
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="leading-relaxed">{toast.message}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 px-4 py-2.5 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4 text-stone-900" />
            <span>Store</span>
          </Link>
          <div className="text-right">
            <h1 className="text-lg font-black tracking-tight text-stone-900">Your Orders</h1>
            <p className="text-[10px] text-stone-500 font-mono">केसियो • Carry Your Vibe</p>
          </div>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200/80 shadow-xs space-y-3">
              <Package className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs font-bold text-stone-500">No previous orders found.</p>
            </div>
          ) : (
            orders.map((order) => {
              const minutesElapsed = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
              const canCancel = order.status === "Paid" && minutesElapsed <= 30;

              return (
                <div key={order._id} className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                  
                  {/* Status Badge */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Order ID</span>
                      <span className="text-xs font-mono font-bold text-stone-800">#{order._id}</span>
                    </div>

                    <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full ${
                      order.status === "Delivered" ? "bg-emerald-600 text-white" :
                      order.status === "Refunded" ? "bg-emerald-700 text-white font-extrabold" :
                      order.status === "Refund Initiated" ? "bg-amber-500 text-white font-extrabold" :
                      order.status === "Cancelled" ? "bg-rose-900 text-white font-extrabold" :
                      "bg-amber-400 text-black font-extrabold"
                    }`}>
                      {order.status === "Refund Initiated" ? "Refund Initiated" : 
                       order.status === "Refunded" ? "Refund Successful" : order.status}
                    </span>
                  </div>

                  {/* Banners */}
                  {order.status === "Refunded" && (
                    <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>✨ Refund Successful! The amount has been credited back to your original payment method.</span>
                    </div>
                  )}

                  {order.status === "Refund Initiated" && (
                    <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                      <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                      <span>🔄 Refund Initiated. Your refund is processing to your original payment method (typically takes 3-7 business days).</span>
                    </div>
                  )}

                  {order.status === "Cancelled" && (
                    <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-800">
                      <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>🚫 This order was cancelled.</span>
                    </div>
                  )}

                  {/* Products */}
                  <div className="space-y-3">
                    {order.products?.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-stone-50/70 p-3 rounded-xl border border-stone-200/60">
                        <img src={p.imageUrl} alt={p.title || "Product"} className="w-14 h-14 object-cover rounded-lg bg-white border shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-stone-900 truncate">{p.title}</h3>
                          <p className="text-[11px] text-stone-500 mt-0.5">Quantity: <span className="font-bold text-stone-900">{p.quantity || 1}</span></p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-stone-900">₹{p.price * (p.quantity || 1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-[11px] text-stone-400">
                    <span>Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => setConfirmModal({ show: true, orderId: order._id })}
                        disabled={actionLoading === order._id}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {actionLoading === order._id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center text-stone-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}