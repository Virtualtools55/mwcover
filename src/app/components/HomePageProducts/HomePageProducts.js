// app/page.js
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, PackageOpen, ChevronLeft, ChevronRight, SlidersHorizontal, MoveRight, CheckCircle2, ShoppingBag } from "lucide-react";

// Categories hierarchy configuration matching your structure
const CATEGORY_SECTIONS = [
  {
    mainTitle: "Mobile Covers",
    categories: [{ label: "Mobile Covers", value: "mobile-cover" }]
  },
  {
    mainTitle: "Charging & Cables",
    categories: [
      { label: "Micro Cable", value: "micro-cable" },
      { label: "Type-C Cable", value: "type-c-cable" },
      { label: "Lightning Cable", value: "lightning-cable" },
      { label: "Fast Charger", value: "fast-charger" },
      { label: "Wireless Charger", value: "wireless-charger" },
      { label: "Car Charger", value: "car-charger" },
      { label: "Multi-port Charger", value: "multi-port-charger" },
    ]
  },
  {
    mainTitle: "Audio & Sound",
    categories: [
      { label: "TWS Earbuds", value: "tws-earbuds" },
      { label: "Neckband", value: "neckband" },
      { label: "Wired Earphones", value: "wired-earphones" },
      { label: "Bluetooth Headphones", value: "bluetooth-headphones" },
      { label: "Portable Speaker", value: "portable-speaker" },
      { label: "AUX Cable", value: "aux-cable" },
    ]
  },
  {
    mainTitle: "Power Bank & Battery",
    categories: [
      { label: "Power Bank", value: "power-bank" },
      { label: "Battery", value: "battery" },
      { label: "Battery Charger", value: "battery-charger" },
      { label: "Wireless Power Bank", value: "wireless-power-bank" },
    ]
  },
  {
    mainTitle: "Stands & Holders",
    categories: [
      { label: "Desk Mobile Stand", value: "desk-mobile-stand" },
      { label: "Car Mobile Holder", value: "car-mobile-holder" },
      { label: "Bike Mobile Holder", value: "bike-mobile-holder" },
      { label: "Magnetic Holder", value: "magnetic-holder" },
      { label: "Flexible Mobile Stand", value: "flexible-mobile-stand" },
    ]
  },
  {
    mainTitle: "Adapters & Converters",
    categories: [
      { label: "OTG Cable", value: "otg-cable" },
      { label: "Type-C to USB Converter", value: "type-c-to-usb-converter" },
      { label: "Type-C to 3.5mm Converter", value: "type-c-to-3.5mm-converter" },
      { label: "HDMI Adapter", value: "hdmi-adapter" },
      { label: "USB Hub", value: "usb-hub" },
      { label: "Card Reader", value: "card-reader" },
    ]
  },
  {
    mainTitle: "Smart Gadgets",
    categories: [
      { label: "Smartwatch", value: "smartwatch" },
      { label: "Fitness Band", value: "fitness-band" },
      { label: "Smart Tag", value: "smart-tag" },
      { label: "Bluetooth Tracker", value: "bluetooth-tracker" },
      { label: "Smart LED Gadgets", value: "smart-led-gadgets" },
    ]
  },
  {
    mainTitle: "Vlogging & Photography",
    categories: [
      { label: "Selfie Stick", value: "selfie-stick" },
      { label: "Tripod", value: "tripod" },
      { label: "Ring Light", value: "ring-light" },
      { label: "Mobile Lens", value: "mobile-lens" },
      { label: "Phone Camera Accessories", value: "phone-camera-accessories" },
    ]
  },
  {
    mainTitle: "Mobile Gaming",
    categories: [
      { label: "Mobile Gaming Controller", value: "mobile-gaming-controller" },
      { label: "Gaming Trigger", value: "gaming-trigger" },
      { label: "Gaming Finger Sleeve", value: "gaming-finger-sleeve" },
      { label: "Mobile Cooling Fan", value: "mobile-cooling-fan" },
      { label: "Gaming Headphones", value: "gaming-headphones" },
    ]
  }
];

function HomeContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [toast, setToast] = useState({ show: false, message: "" });

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update selected category when URL query parameter changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let res = await fetch("/api/products");
      if (!res.ok) {
        res = await fetch("/api/admin/fetchProducts");
      }
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2500);
  };

  const scrollSlider = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.title && product.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-amber-400 selection:text-black relative">
      
      {/* Top Announcement Bar */}
      <div className="bg-amber-400 text-black text-[11px] sm:text-xs font-bold py-2 px-3 text-center tracking-wide">
        ⚡ Minimum Order Quantity is 3 Items | Fast Shipping Across India 🚀
      </div>

      {/* Header / Navbar - Centered Search Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-3 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="w-full max-w-2xl mx-auto flex items-center gap-3">
          <div className="relative flex-1 flex items-center bg-neutral-100 focus-within:bg-white border border-neutral-200 focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10 rounded-2xl px-3.5 py-2.5 transition-all duration-200">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 mr-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search covers, chargers, earbuds, powerbanks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-neutral-400 hover:text-neutral-600 bg-neutral-200 hover:bg-neutral-300 rounded-full px-2 py-0.5 ml-1.5 font-bold transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          <Link
            href="/cart"
            className="p-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-2xl text-neutral-800 transition-all flex items-center justify-center shrink-0"
            title="View Cart"
          >
            <ShoppingBag className="w-5 h-5 text-neutral-900" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-10">

        {/* Category Navigation Bar */}
        <div className="space-y-2 bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>Explore Categories</span>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
              <span>Swipe</span>
              <MoveRight className="w-3 h-3" />
            </div>
          </div>

          <div className="relative flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              className="z-10 p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 transition-all cursor-pointer border border-neutral-200 shrink-0"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={scrollContainerRef}
              className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none scroll-smooth w-full touch-pan-x"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 touch-manipulation ${
                  selectedCategory === "all" 
                    ? "bg-black text-white shadow-md ring-2 ring-black" 
                    : "bg-neutral-100 text-neutral-700 hover:text-black border border-neutral-200"
                }`}
              >
                All Products
              </button>

              {CATEGORY_SECTIONS.flatMap(s => s.categories).map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 touch-manipulation ${
                    selectedCategory === cat.value 
                      ? "bg-black text-white shadow-md ring-2 ring-black" 
                      : "bg-neutral-100 text-neutral-700 hover:text-black border border-neutral-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollSlider("right")}
              className="z-10 p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 transition-all cursor-pointer border border-neutral-200 shrink-0"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products Loading / Listing Grid */}
        {loading ? (
          <div className="text-center py-20 text-neutral-500 text-sm font-medium animate-pulse">
            Loading products catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-neutral-300 bg-white rounded-2xl space-y-3 px-4">
            <PackageOpen className="w-10 h-10 text-neutral-400 mx-auto" />
            <p className="text-neutral-700 text-sm font-semibold">No products found in this section.</p>
            <p className="text-neutral-400 text-xs">Try selecting 'All Products' or search for another keyword.</p>
          </div>
        ) : selectedCategory !== "all" || searchQuery !== "" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} onAddToCartSuccess={showToast} />
            ))}
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {CATEGORY_SECTIONS.map((section, idx) => {
              const sectionCategoryValues = section.categories.map(c => c.value);
              const sectionProducts = products.filter(p => sectionCategoryValues.includes(p.category));

              if (sectionProducts.length === 0) return null;

              return (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <h2 className="text-sm sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      {section.mainTitle}
                    </h2>
                    <span className="text-xs text-neutral-500 font-medium">
                      {sectionProducts.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                    {sectionProducts.map((product) => (
                      <ProductCard key={product._id || product.id} product={product} onAddToCartSuccess={showToast} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

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

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50 flex items-center justify-center text-xs font-bold text-neutral-500">Loading catalog...</div>}>
      <HomeContent />
    </Suspense>
  );
}

// Reusable Product Card Component
function ProductCard({ product, onAddToCartSuccess }) {
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const productId = product._id || product.id;
      
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          title: product.title,
          price: Number(product.price) || 0,
          imageUrl: product.imageUrl || product.image,
          quantity: 1,
        }),
      });

      if (res.status === 401) {
        window.location.href = "/auth/signin";
        return;
      }

      const json = await res.json();
      if (json.success) {
        onAddToCartSuccess(`${product.title} ✨ Added to cart successfully!`);
      } else {
        onAddToCartSuccess(json.error || "Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      onAddToCartSuccess("Something went wrong. Try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:border-neutral-400 transition-all group flex flex-col justify-between shadow-xs hover:shadow-md w-full">
      <div>
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          <img
            src={product.imageUrl || product.image || "/placeholder.png"}
            alt={product.title || "Product"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&auto=format&fit=crop&q=60";
            }}
          />
          {product.category && (
            <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-md text-[9px] text-neutral-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-neutral-200 shadow-xs max-w-[80%] truncate">
              {product.category.replace(/-/g, " ")}
            </span>
          )}
        </div>
        <div className="p-2.5 sm:p-3.5 space-y-1">
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-1">
            {product.title}
          </h3>
          <div className="flex items-center gap-1.5">
            <p className="text-xs sm:text-sm font-bold text-neutral-900">₹{product.price}</p>
            {product.originalPrice && (
              <p className="text-[10px] sm:text-xs text-neutral-400 line-through">₹{product.originalPrice}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-2.5 sm:p-3.5 pt-0 grid grid-cols-2 gap-1.5">
        <Link
          href={`/product/${product._id || product.id}`}
          className="w-full block text-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-1.5 rounded-xl text-[11px] sm:text-xs transition-all border border-neutral-200"
        >
          Details
        </Link>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-1.5 rounded-xl text-[11px] sm:text-xs transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  );
}