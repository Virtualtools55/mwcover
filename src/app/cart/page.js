// app/cart/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Trash2, Loader2, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { startRazorpayPayment } from "@/utils/payment";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  const fetchCartItems = async () => {
    try {
      const res = await fetch("/api/cart");
      
      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }

      const json = await res.json();
      if (json.success) {
        setCart(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2500);
  };

  const removeItem = async (id) => {
    try {
      const res = await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }
      const json = await res.json();
      if (json.success) {
        fetchCartItems();
      }
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Total quantity count across all cart items
  const totalQuantity = cart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const isMinQuantityMet = totalQuantity >= 3;

  const subtotal = cart.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + price * qty;
  }, 0);
  
  const shipping = 0;
  const total = subtotal + shipping;

  const handleCartCheckout = () => {
    if (!isMinQuantityMet) {
      showToast("⚠️ Minimum 3 items required! Vibe check failed.");
      return;
    }
    if (cart.length === 0) return;

    const formattedProducts = cart.map((item) => ({
      productId: item.productId || item._id,
      title: item.title,
      price: Number(item.price) || 0,
      imageUrl: item.imageUrl,
      quantity: Number(item.quantity) || 1,
    }));

    setCheckoutLoading(true);
    startRazorpayPayment({
      products: formattedProducts,
      amount: total,
      router,
    });
  };

  if (loading) return <div className="min-h-screen bg-neutral-50 flex items-center justify-center text-xs font-bold text-neutral-600">Loading cart collection...</div>;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 sm:px-8 py-10 pb-28 relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black mb-8">Your Cart Collection</h1>
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-xs text-neutral-500 mb-4 font-bold">Your cart collection is empty.</p>
            <Link href="/" className="px-6 py-3 bg-neutral-900 text-white rounded-2xl text-xs font-bold inline-block">Explore Drops</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cart.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl p-4 border border-neutral-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-contain bg-neutral-100 rounded-xl p-1 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold line-clamp-1">{item.title}</h4>
                      <p className="text-xs font-black mt-1">₹{item.price} {item.quantity > 1 && <span className="text-[10px] text-neutral-400 font-normal">× {item.quantity}</span>}</p>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0 cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200 p-6 h-fit space-y-4">
              <h3 className="text-sm font-black pb-3 border-b border-neutral-100">Order Summary</h3>
              
              {!isMinQuantityMet && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-amber-800 text-[11px] font-semibold leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Add {3 - totalQuantity} more item(s) to unlock checkout (Min MOQ: 3 items).</span>
                </div>
              )}

              <div className="flex justify-between text-xs"><span>Total Items</span><span className="font-bold">{totalQuantity}</span></div>
              <div className="flex justify-between text-xs"><span>Subtotal</span><span className="font-bold">₹{subtotal}</span></div>
              <div className="flex justify-between text-xs pb-3 border-b border-neutral-100"><span>Shipping</span><span className="font-bold text-emerald-600">FREE</span></div>
              <div className="flex justify-between text-sm font-black mb-4"><span>Total</span><span>₹{total}</span></div>
              
              <button
                onClick={handleCartCheckout}
                disabled={checkoutLoading}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-40"
              >
                {checkoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>Proceed to Pay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screen Centered Modern Custom Toast Notification */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 transform ${
          toast.show 
            ? "opacity-100 scale-100 pointer-events-auto" 
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <div className="bg-neutral-900/95 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-2xl border border-neutral-800 flex items-center gap-3.5 max-w-sm w-[90vw]">
          <div className="w-8 h-8 rounded-2xl bg-amber-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-100 line-clamp-2">
            {toast.message}
          </span>
        </div>
      </div>
    </div>
  );
}