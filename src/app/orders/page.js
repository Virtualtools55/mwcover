
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, Clock, ArrowLeft, PackageCheck } from "lucide-react";
import Link from "next/link";

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success");
  const isFailed = searchParams.get("failed");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/list");
      const json = await res.json();
      if (json.success) setOrders(json.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order? Refund will take 3-5 working days.")) return;
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
        alert(json.error);
      }
    } catch (err) {
      alert("Failed to process cancellation request.");
    } finally {
      setActionLoading(null);
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
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-neutral-600 bg-white px-4 py-2 rounded-2xl border border-neutral-200 shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Store</span>
          </Link>
          <h1 className="text-lg font-black text-neutral-900">Your Orders</h1>
        </div>

        {isSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Payment successful! Your order has been placed securely.</span>
          </div>
        )}

        {isFailed && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-bold shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Payment failed or dropped. Order marked as unsuccessful.</span>
          </div>
        )}

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-neutral-200">
              <p className="text-xs font-bold text-neutral-500">No previous orders found.</p>
            </div>
          ) : (
            orders.map((order) => {
              const minutesElapsed = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
              const canCancel = order.status === "Paid" && minutesElapsed <= 30;

              return (
                <div key={order._id} className="bg-white rounded-3xl border border-neutral-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <span className="text-[10px] font-mono text-neutral-400">ID: {order._id}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                      order.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      order.status === "Failed" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                      "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {order.status === "Refund Initiated" ? "Refund Processing (3-5 Days)" : order.status}
                    </span>
                  </div>

                  {/* Aesthetic Delivery Banner for Paid Orders */}
                  {order.status === "Paid" && (
                    <div className="flex items-center gap-2.5 bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3 text-xs text-neutral-700">
                      <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Estimated Delivery: <strong className="font-black text-neutral-900">3-7 working days</strong></span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {order.products.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img src={p.imageUrl} alt={p.title} className="w-14 h-14 object-contain rounded-xl bg-neutral-50 border border-neutral-100 p-1" />
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-neutral-900 line-clamp-1">{p.title}</h3>
                          <p className="text-xs font-black text-neutral-700 mt-0.5">₹{p.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={actionLoading === order._id}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        {actionLoading === order._id && <Loader2 className="w-3 h-3 animate-spin" />}
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

