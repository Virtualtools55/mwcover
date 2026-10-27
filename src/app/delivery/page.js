// app/delivery/page.js
"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Package, Loader2, RefreshCw, XCircle, CheckCircle, Lock, Phone, ZoomIn, X, ShoppingBag, MapPin, Sparkles } from "lucide-react";

export default function DeliveryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [clientIp, setClientIp] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [targetStatus, setTargetStatus] = useState(""); 
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [zoomImageUrl, setZoomImageUrl] = useState(null);
  const [zoomImageTitle, setZoomImageTitle] = useState("");
  const [zoomImagePrice, setZoomImagePrice] = useState("");

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const fetchDeliveryOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/delivery/orders");
      const json = await res.json();
      if (res.status === 403 || !json.success) {
        setUnauthorized(true);
      } else {
        const activeOrders = (json.orders || []).filter(
          (order) => order.status === "Paid"
        );
        setOrders(activeOrders);
        setClientIp(json.clientIp || "127.0.0.1");
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
        showToast("📧 Verification OTP sent to customer's email!", "success");
      } else {
        showToast(`⚠️ ${data.error || "Failed to send OTP."}`, "error");
      }
    } catch {
      showToast("❌ Network error while sending OTP.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      showToast("⚠️ Please enter the 6-digit OTP.", "error");
      return;
    }
    setActionLoading(true);

    try {
      const res = await fetch("/api/delivery/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", orderId: selectedOrder._id, otp, newStatus: targetStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✨ ${data.message}`, "success");
        setModalOpen(false);
        fetchDeliveryOrders();
      } else {
        showToast(`⚠️ ${data.error || "Verification failed."}`, "error");
      }
    } catch {
      showToast("❌ Error verifying OTP.", "error");
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
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 p-4 sm:p-6 md:p-10 relative">
      
      {/* Floating Toast Notification */}
      <div
        className={`fixed top-6 right-6 z-50 transition-all duration-300 transform ${
          toast.show 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold max-w-sm w-[90vw] ${
          toast.type === "error" 
            ? "bg-rose-50 border-rose-200 text-rose-800" 
            : "bg-neutral-900 border-amber-400/50 text-white"
        }`}>
          {toast.type === "error" ? (
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className="leading-relaxed">{toast.message}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-5 bg-white/60 backdrop-blur-md p-5 rounded-2xl shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">Caseo Delivery Dispatch</h1>
            <p className="text-[11px] text-amber-700 font-mono mt-1">Authorized Terminal IP: {clientIp}</p>
          </div>
          <button
            onClick={fetchDeliveryOrders}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-5">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-stone-200/80 shadow-sm space-y-3">
              <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500 font-medium">No pending paid orders awaiting delivery.</p>
            </div>
          ) : (
            orders.map((order) => {
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

              const customerPhone = 
                order.phone || 
                order.shippingAddress?.phone || 
                order.userId?.phone || 
                order.customerPhone || 
                order.phoneNumber || 
                "N/A";

              const deliveryAddress = 
                order.address || 
                order.shippingAddress?.address || 
                order.userId?.address || 
                "Address Not Available";

              const deliveryPincode = 
                order.pincode || 
                order.shippingAddress?.pincode || 
                order.userId?.pincode || 
                "";

              return (
                <div key={order._id} className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-md space-y-5 transition-all hover:shadow-lg">
                  
                  {/* Order Meta Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-3.5 gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">Order ID</span>
                      <span className="text-xs font-bold font-mono text-stone-900">
                        #{order._id.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {order.status}
                    </span>
                  </div>

                  {/* Customer Contact Card */}
                  <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/30 border border-amber-200/60 rounded-2xl p-4 space-y-3 text-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-stone-900 text-sm">{customerName}</p>
                        <p className="text-stone-500 text-[11px] mt-0.5">{customerEmail}</p>
                      </div>
                      {customerPhone !== "N/A" ? (
                        <a
                          href={`tel:${customerPhone}`}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-xs active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call: {customerPhone}
                        </a>
                      ) : (
                        <span className="text-rose-600 text-xs font-semibold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                          ⚠️ No Phone Number Provided
                        </span>
                      )}
                    </div>

                    {/* Delivery Address Section */}
                    <div className="pt-2 border-t border-amber-200/50 flex items-start gap-2 text-stone-800">
                      <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[11px] text-stone-900 uppercase block">Delivery Address:</span>
                        <p className="text-xs font-medium text-stone-700 leading-snug mt-0.5">
                          {deliveryAddress} {deliveryPincode ? `- ${deliveryPincode}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Products Ordered Section */}
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Ordered Mobile Cover(s)</p>
                    {order.products?.map((p, idx) => {
                      const productImg = p.image || p.img || p.imgUrl || p.imageUrl;
                      return (
                        <div key={idx} className="flex items-center gap-4 bg-stone-50/80 p-4 rounded-2xl border border-stone-200/70">
                          {productImg ? (
                            <div 
                              onClick={() => {
                                setZoomImageUrl(productImg);
                                setZoomImageTitle(p.title || "Mobile Cover");
                                setZoomImagePrice(p.price);
                              }}
                              className="relative group cursor-pointer w-20 h-20 rounded-xl overflow-hidden border border-stone-300 bg-white shadow-xs shrink-0"
                              title="Click to zoom image"
                            >
                              <img 
                                src={productImg} 
                                alt={p.title || "Product"} 
                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" 
                              />
                              <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                                <ZoomIn className="w-5 h-5 mb-0.5" />
                                <span className="text-[9px] font-bold uppercase tracking-wider">Zoom</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-stone-200/80 rounded-xl flex items-center justify-center shrink-0">
                              <Package className="w-6 h-6 text-stone-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">{p.title || p.name || "Caseo Cover"}</h4>
                            <p className="text-[11px] text-stone-500 font-medium mt-1">
                              Quantity: <span className="text-stone-900 font-bold">{p.quantity || 1}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-stone-400 block uppercase">Price</span>
                            <span className="text-xs sm:text-sm font-black text-stone-900">₹{p.price * (p.quantity || 1)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                    <div>
                      <span className="text-stone-500 text-[11px]">Total Bill Amount:</span>
                      <strong className="text-stone-900 font-black text-base ml-1.5">₹{order.amount}</strong>
                      <span className="text-stone-400 text-[10px] block mt-0.5 font-mono">Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <button
                        onClick={() => handleOpenModal(order, "Cancelled")}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      >
                        <XCircle className="w-4 h-4" /> Cancel Order
                      </button>
                      <button
                        onClick={() => handleOpenModal(order, "Delivered")}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" /> Mark Delivered
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Image Zoom Lightbox Modal */}
      {zoomImageUrl && (
        <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="relative bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl flex flex-col items-center space-y-4 border border-stone-200">
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-4 right-4 p-2.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-700 transition-colors cursor-pointer shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center pr-10">
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">{zoomImageTitle}</h3>
              <p className="text-xs font-black text-amber-600 mt-0.5">₹{zoomImagePrice}</p>
            </div>
            
            <div className="w-full aspect-square bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 flex items-center justify-center p-3 shadow-inner">
              <img 
                src={zoomImageUrl} 
                alt="Zoomed Product Cover" 
                className="object-contain w-full h-full max-h-[65vh] hover:scale-125 transition-transform duration-300 cursor-zoom-in" 
              />
            </div>
            <p className="text-[10px] text-stone-400 font-medium text-center">Hover or pinch to inspect details closely. Tap X to close.</p>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 shrink-0">
                <Lock className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Customer OTP Verification</h3>
                <p className="text-[10px] text-stone-500">Sent to customer's email to confirm {targetStatus.toLowerCase()}</p>
              </div>
            </div>

            {actionLoading && !otpSent ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl px-4 py-3 text-sm text-stone-900 text-center font-mono tracking-widest focus:outline-none focus:border-amber-600 shadow-inner"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-2xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
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