
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Trash2, ArrowRight, Loader2, Zap } from "lucide-react";
import { startRazorpayPayment } from "@/utils/payment";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchCartItems = async () => {
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      if (json.success) setCart(json.data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const removeItem = async (id) => {
    try {
      const res = await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchCartItems();
      }
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Precise calculation based on unique items and quantities from database / state
  const subtotal = cart.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + price * qty;
  }, 0);
  
  const shipping = 0;
  const total = subtotal + shipping;

  const handleCartCheckout = () => {
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 sm:px-8 py-10 pb-28">
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
                  <button onClick={() => removeItem(item._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200 p-6 h-fit space-y-4">
              <h3 className="text-sm font-black pb-3 border-b border-neutral-100">Order Summary</h3>
              <div className="flex justify-between text-xs"><span>Subtotal</span><span className="font-bold">₹{subtotal}</span></div>
              <div className="flex justify-between text-xs pb-3 border-b border-neutral-100"><span>Shipping</span><span className="font-bold text-emerald-600">FREE</span></div>
              <div className="flex justify-between text-sm font-black mb-4"><span>Total</span><span>₹{total}</span></div>
              
              <button
                onClick={handleCartCheckout}
                disabled={checkoutLoading}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                {checkoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>Proceed to Checkout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

