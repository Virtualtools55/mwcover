
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Zap, Loader2, Search, X, Package } from "lucide-react";
import Link from "next/link";

export default function HomePageProducts() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/fetch_products", { cache: "no-store" });
        const json = await res.json();

        if (json.success) {
          setProducts(json.data);
          setFilteredProducts(json.data);
        } else {
          setError(json.error || "Failed to load products");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Something went wrong connecting to the server.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Instant Search Filter Handler
  const handleSearchChange = (e) => {
    const text = e.target.value;
    setQuery(text);

    if (!text.trim()) {
      setFilteredProducts(products);
      return;
    }

    const lowerQuery = text.toLowerCase();
    const results = products.filter((product) =>
      product.title?.toLowerCase().includes(lowerQuery) ||
      product.category?.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery)
    );
    setFilteredProducts(results);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
        }),
      });

      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }

      const json = await res.json();

      if (json.success) {
        setToastMessage(`Added ${product.title} to bag!`);
        setTimeout(() => setToastMessage(""), 2500);
      } else {
        setToastMessage(json.error || "Failed to add to cart");
        setTimeout(() => setToastMessage(""), 2500);
      }
    } catch (err) {
      console.error("Cart API error:", err);
      router.push("/auth/signin");
    }
  };

  const handleInstantBuy = async (e, product) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }
      router.push(`/product/${product._id}`);
    } catch (err) {
      router.push("/auth/signin");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-800 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading drops...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 bg-neutral-50 min-h-screen pb-24 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}

      {/* Top Search Bar & Header Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-neutral-200/80 p-4 rounded-2xl shadow-sm">
          
          <div className="flex items-center gap-2 bg-[#0B0B0B] text-white px-3 py-1.5 rounded-full border border-neutral-800 shadow-sm w-fit">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white">
              Exclusive Collection
            </span>
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
          </div>

          {/* Search Input Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Search 'realme narzo'..."
              className="w-full bg-neutral-50 border border-neutral-200 hover:border-neutral-300 focus:border-yellow-400 text-neutral-900 placeholder-neutral-400 text-xs rounded-xl pl-9 pr-9 py-2.5 outline-none transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFilteredProducts(products);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-medium text-neutral-500">
            {query ? `Showing results for "${query}"` : "All available designs"}
          </p>
          <span className="text-xs font-bold text-neutral-600 bg-neutral-200/60 px-3 py-1 rounded-full">
            {filteredProducts.length} Items
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-neutral-200 shadow-sm mt-2">
          <Package className="w-10 h-10 text-neutral-400 mb-2" />
          <p className="text-sm font-bold text-neutral-800">No products found matching &quot;{query}&quot;</p>
          <p className="text-xs text-neutral-400 mt-1 mb-6">Try searching for broader keywords like &quot;realme&quot; or model numbers.</p>
          <button
            onClick={() => {
              setQuery("");
              setFilteredProducts(products);
            }}
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Clean and Compact Grid Layout */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredProducts.map((product) => (
            <div 
              key={product._id} 
              onClick={() => {
                router.push(`/product/${product._id}`);
              }}
              className="bg-white rounded-2xl p-2.5 shadow-sm border border-neutral-100 flex flex-col justify-between transition-all duration-300 hover:shadow-md group cursor-pointer"
            >
              <div>
                {/* Image Container */}
                <div className="relative w-full overflow-hidden rounded-xl bg-neutral-50 mb-2.5 aspect-square flex items-center justify-center p-2">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-md text-neutral-900 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    New
                  </span>
                </div>

                {/* Title & Price Section */}
                <div className="px-1 mb-3">
                  <h3 className="text-xs font-bold text-neutral-800 line-clamp-1 tracking-tight">
                    {product.title}
                  </h3>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-neutral-900">
                      ₹{product.price}
                    </span>
                    <span className="text-[10px] text-neutral-400 line-through">
                      ₹{product.price + 300}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-1 pt-2 border-t border-neutral-100">
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="flex items-center justify-center gap-1 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Cart</span>
                </button>

                <button
                  onClick={(e) => handleInstantBuy(e, product)}
                  className="flex items-center justify-center gap-1 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-[10px] font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span>Buy</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

