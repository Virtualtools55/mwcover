
"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Package, Loader2, RefreshCw, XCircle, CheckCircle, Lock } from "lucide-react";

export default function DeliveryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [clientIp, setClientIp] = useState("");

  // Modal State for OTP
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetStatus, setTargetStatus] = useState(""); 
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDeliveryOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/delivery/orders");
      const json = await res.json();
      if (res.status === 403 || !json.success) {
        setUnauthorized(true);
      } else {
        setOrders(json.orders);
        setClientIp(json.clientIp);
        setUnauthorized(false);
      }
    } catch {
      setUnauthorized(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  const handleOpenModal = async (order, status) => {
    setSelectedOrder(order);
    setTargetStatus(status);
    setOtp("");
    setOtpSent(false);
    setModalOpen(true);
    setActionLoading(true);

    try {
      const res = await fetch("/api/delivery/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", orderId: order._id, newStatus: status }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
      } else {
        alert(data.error || "Failed to send OTP.");
      }
    } catch {
      alert("Network error while sending OTP.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return alert("Please enter the OTP.");
    setActionLoading(true);

    try {
      const res = await fetch("/api/delivery/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", orderId: selectedOrder._id, otp, newStatus: targetStatus }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setModalOpen(false);
        fetchDeliveryOrders();
      } else {
        alert(data.error || "Verification failed.");
      }
    } catch {
      alert("Error verifying OTP.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-stone-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-rose-50 p-5 rounded-full border border-rose-200 mb-4 shadow-sm">
          <ShieldAlert className="w-12 h-12 text-rose-600" />
        </div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">Access Denied</h1>
        <p className="text-xs text-stone-500 max-w-sm">This device IP address is not authorized for delivery management.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-5">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Cover Delivery</h1>
            <p className="text-[11px] text-amber-700 font-mono mt-1">Authorized IP: {clientIp}</p>
          </div>
          <button
            onClick={fetchDeliveryOrders}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-xs font-medium flex items-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200/80 shadow-sm">
              <p className="text-xs text-stone-500 font-medium">No orders found.</p>
            </div>
          ) : (
            orders.map((order) => {
              // Extract customer name & email supporting populated user relation or direct fields
              const customerName = 
                order.userId?.name || 
                order.name || 
                order.shippingAddress?.name || 
                order.customerName || 
                "Customer";

              const customerEmail = 
                order.userId?.email || 
                order.email || 
                order.shippingAddress?.email || 
                order.customerEmail || 
                "No Email";

              return (
                <div key={order._id} className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3 gap-2">
                    <div>
                      {/* Customer ID completely hidden per instruction */}
                      <span className="text-xs font-serif font-bold text-stone-900">
                        Order Items & Details
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit ${
                      order.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      order.status === "Delivered" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {/* Product List with Image Fallbacks and Customer Name Display */}
                  <div className="space-y-3">
                    {order.products?.map((p, idx) => {
                      const productImg = p.image || p.img || p.imgUrl || p.imageUrl;
                      return (
                        <div key={idx} className="flex items-center gap-4 bg-stone-50/70 p-3.5 rounded-xl border border-stone-200/60">
                          {productImg ? (
                            <img 
                              src={productImg} 
                              alt={p.title || "Product"} 
                              className="w-14 h-14 object-cover rounded-lg border border-stone-200 bg-white" 
                            />
                          ) : (
                            <div className="w-14 h-14 bg-stone-200/80 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-stone-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-stone-900">{p.title || p.name || "Item"}</h4>
                            <p className="text-[11px] text-stone-600 font-medium mt-0.5">
                              Ordered by: <span className="text-stone-900 font-bold">{customerName}</span> ({customerEmail})
                            </p>
                            <p className="text-[10px] text-stone-400 mt-0.5">Quantity: {p.quantity || 1}</p>
                          </div>
                          <span className="text-xs font-bold text-stone-900">₹{p.price}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer & Action Buttons */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                    <div>
                      <span className="text-stone-500">Total Amount: <strong className="text-stone-900 font-bold">₹{order.amount}</strong></span>
                      <span className="text-stone-400 text-[10px] block mt-0.5">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>

                    {order.status === "Paid" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(order, "Cancelled")}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel Order
                        </button>
                        <button
                          onClick={() => handleOpenModal(order, "Delivered")}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* OTP Verification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Customer OTP Verification</h3>
                <p className="text-[10px] text-stone-500">Sent to customer's email to confirm {targetStatus.toLowerCase()}</p>
              </div>
            </div>

            {actionLoading && !otpSent ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 text-center font-mono tracking-widest focus:outline-none focus:border-amber-600"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-xs font-medium cursor-pointer flex items-center justify-center gap-2 transition-colors"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Verify & Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

