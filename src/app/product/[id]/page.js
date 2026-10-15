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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-900" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Product Not Found</h1>
        <p className="text-xs text-neutral-500 mb-6">{error || "The item you are looking for doesn't exist."}</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 mb-6 bg-white px-4 py-2 rounded-2xl border border-neutral-200 shadow-sm w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 flex items-center justify-center p-4">
            <img src={product.imageUrl} alt={product.title} className="object-contain w-full h-full" />
          </div>

          <div className="flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block mb-3">
                In Stock & Ready
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 mb-3">
                {product.title}
              </h1>
              
              <div className="flex items-baseline gap-3 mb-4">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base font-semibold text-neutral-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                <span className="text-2xl font-black text-neutral-900">
                  ₹{product.price}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium mb-6">
                {product.description || "Premium quality build designed for everyday durability and luxury styling."}
              </p>

              <div className="grid grid-cols-2 gap-3 py-4 border-t border-b border-neutral-100 mb-6">
                <div className="flex items-center gap-2 text-neutral-700 text-xs font-bold">
                  <Truck className="w-4 h-4 text-neutral-900" />
                  <span>Express Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-neutral-900" />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {adding ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Screen Centered Toast Alert */}
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