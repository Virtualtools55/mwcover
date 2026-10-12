// app/orders/page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Clock, ArrowLeft, PackageCheck, Ban, RefreshCw, CheckCircle2 as CheckDone, Clock3, Package } from "lucide-react";
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

  useEffect(() => {
    if (isSuccessParam || isFailedParam) {
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
        setShowFailedBanner(false);
        router.replace(pathname, { scroll: false });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccessParam, isFailedParam, router, pathname]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/list");
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
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order? Refund will take 5-7 business days.")) return;
    setActionLoading(orderId);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetchOrders();
      } else {
        alert(json.error || "Failed to cancel order.");
      }
    } catch (err) {
      alert("Failed to process cancellation request.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center text-black">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFC700]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-stone-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header matching Caseo Navbar & Store style */}
        <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xs font-bold text-stone-900 bg-stone-100 hover:bg-stone-200 px-4 py-2.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-stone-900" />
            <span>Store</span>
          </Link>
          
          <div className="text-right">
            <h1 className="text-lg font-black tracking-tight text-stone-900">Your Orders</h1>
            <p className="text-[10px] text-stone-500 font-mono">केसियो • Carry Your Vibe</p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {showSuccessBanner && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Payment successful! Your order has been placed securely.</span>
          </div>
        )}

        {/* Failed Alert Banner */}
        {showFailedBanner && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Payment failed or dropped. Order marked as unsuccessful.</span>
          </div>
        )}

        {/* Orders List */}
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
                <div key={order._id} className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:shadow-sm">
                  
                  {/* Order Reference ID & Caseo Status Badges */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Order ID</span>
                      <span className="text-xs font-mono font-bold text-stone-800">#{order._id}</span>
                    </div>

                    {/* STRICT COLOR LOGIC: Delivered = Green, Failed = Red, Paid/Pending = Caseo Yellow */}
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full ${
                      order.status === "Delivered" ? "bg-emerald-600 text-white" :
                      order.status === "Failed" ? "bg-rose-600 text-white" :
                      order.status === "Paid" || order.status === "Pending" ? "bg-[#FFC700] text-black font-extrabold" :
                      "bg-stone-900 text-white"
                    }`}>
                      {order.status === "Refund Initiated" ? "Refund Processing" : order.status}
                    </span>
                  </div>

                  {/* Context Banners inside card */}
                  {(order.status === "Paid" || order.status === "Pending") && (
                    <div className="flex items-center gap-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl px-4 py-3 text-xs text-amber-900">
                      <PackageCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Estimated Delivery: <strong className="font-bold text-stone-900">3-7 working days</strong></span>
                    </div>
                  )}

                  {order.status === "Delivered" && (
                    <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs text-emerald-800">
                      <CheckDone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Successfully delivered to your address. Enjoy your Caseo cover!</span>
                    </div>
                  )}

                  {order.status === "Cancelled" && (
                    <div className="flex items-center gap-2.5 bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-600">
                      <Ban className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>This order was cancelled by you.</span>
                    </div>
                  )}

                  {order.status === "Failed" && (
                    <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Payment was unsuccessful or session expired.</span>
                    </div>
                  )}

                  {order.status === "Refund Initiated" && (
                    <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                      <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 animate-spin" />
                      <span>Order cancelled. Refund initiated to your original payment method within <strong className="font-bold text-stone-900">5-7 business days</strong>.</span>
                    </div>
                  )}

                  {/* Products Grid / List */}
                  <div className="space-y-3">
                    {order.products?.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-stone-50/70 p-3 rounded-xl border border-stone-200/60">
                        <img 
                          src={p.imageUrl} 
                          alt={p.title || "Product"} 
                          className="w-14 h-14 object-cover rounded-lg bg-white border border-stone-200 shrink-0" 
                        />
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

                  {/* Footer Timestamp & Action Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-stone-100 gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={actionLoading === order._id}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                      >
                        {actionLoading === order._id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Cancel Order (30m window)</span>
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
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center text-stone-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFC700]" />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}