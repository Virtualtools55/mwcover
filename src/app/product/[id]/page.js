// app/product/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ShieldCheck, Truck, Zap } from "lucide-react";
import { startRazorpayPayment } from "@/utils/payment";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleCheckout = () => {
    startRazorpayPayment({
      products: [
        {
          productId: product._id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
        },
      ],
      amount: product.price,
      router,
    });
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
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
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
                <span className="text-2xl font-black text-neutral-900">₹{product.price}</span>
                <span className="text-sm font-semibold text-neutral-400 line-through">₹{product.price + 300}</span>
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
              onClick={handleCheckout}
              className="w-full py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span>Proceed to Checkout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}