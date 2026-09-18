"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, Package } from "lucide-react";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearchResults() {
      if (!query) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch search results", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Info */}
        <div className="bg-[#121212] border border-neutral-800 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-yellow-400 text-neutral-950 rounded-xl">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              Search Results for &quot;<span className="text-yellow-400">{query}</span>&quot;
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              {loading ? "Searching catalog..." : `Found ${products.length} matching mobile covers`}
            </p>
          </div>
        </div>

        {/* Results Grid / States */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl space-y-3">
            <Package className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-sm font-semibold text-neutral-300">No products found matching your search.</p>
            <p className="text-xs text-neutral-500">Try searching for broader keywords like &quot;realme&quot; or &quot;narzo&quot;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product._id} 
                className="bg-[#121212] border border-neutral-800 hover:border-yellow-400/50 p-4 rounded-2xl transition-all group flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="w-full h-48 bg-neutral-900 rounded-xl overflow-hidden mb-4 border border-neutral-800">
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-yellow-400">₹{product.price}</span>
                  <Link
                    href={`/product/${product._id}`}
                    className="text-[11px] font-semibold bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}