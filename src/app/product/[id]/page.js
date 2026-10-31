// app/product/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ShieldCheck, Truck, ShoppingBag, CheckCircle2 } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const res = await fetch(`/api/fetch_products`, { cache: "no-store" });
        const json = await res.json();

        if (json.success) {
          const found = json.data.find((item) => item._id === id);
          if (found) {
            setProduct(found);
          } else {
            setError("Product not found");
          }
        } else {
          setError("Failed to load product data");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Server error connecting to database");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProductDetails();
  }, [id]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2500);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          title: product.title,
          price: Number(product.price) || 0,
          imageUrl: product.imageUrl,
          quantity: 1,
        }),
      });

      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }

      const json = await res.json();
      if (json.success) {
        showToast(`${product.title} ✨ Added to cart successfully!`);
      } else {
        showToast(json.error || "Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast("Something went wrong. Try again.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs font-black uppercase text-neutral-600 tracking-wider">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <span>Loading product details...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Product Not Found</h1>
        <p className="text-xs text-neutral-500 mb-6">{error || "The item you are looking for doesn't exist."}</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-extrabold rounded-xl cursor-pointer transition-all shadow-sm active:scale-95"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-neutral-900 py-8 px-4 sm:px-6 lg:px-8 relative font-sans selection:bg-amber-400 selection:text-black">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-neutral-800 hover:text-neutral-950 mb-6 bg-white hover:bg-neutral-100 px-4 py-2 rounded-2xl border border-neutral-200 shadow-xs w-fit cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>Back</span>
        </button>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100/70 border border-neutral-200/60 flex items-center justify-center p-4">
            <img src={product.imageUrl} alt={product.title} className="object-contain w-full h-full" />
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-950 bg-amber-400 px-3 py-1 rounded-full border border-amber-500/30 inline-block mb-3 shadow-xs">
                In Stock & Ready
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950 mb-3">
                {product.title}
              </h1>
              
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-black text-neutral-950">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm font-semibold text-rose-600 line-through font-mono">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium mb-6">
                {product.description || "Premium quality build designed for everyday durability and luxury styling."}
              </p>

              <div className="grid grid-cols-2 gap-3 py-4 border-t border-b border-neutral-200/60 mb-6">
                <div className="flex items-center gap-2 text-neutral-800 text-xs font-bold">
                  <Truck className="w-4 h-4 text-amber-500" />
                  <span>Express Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-800 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 border border-amber-500/40 text-neutral-950 font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {adding ? (
                <Loader2 className="w-5 h-5 animate-spin text-neutral-950" />
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 text-neutral-950" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Centered Toast */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 transition-all duration-300 transform ${
          toast.show 
            ? "opacity-100 scale-100 pointer-events-auto" 
            : "opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <div className="bg-neutral-900 text-white px-6 py-4 rounded-3xl shadow-2xl border border-neutral-800 flex items-center gap-3.5 max-w-sm w-[90vw]">
          <div className="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-neutral-950 stroke-[2.5]" />
          </div>
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-100 line-clamp-2">
            {toast.message}
          </span>
        </div>
      </div>
    </div>
  );
}