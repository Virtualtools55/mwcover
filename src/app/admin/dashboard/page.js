// app/admin/dashboard/page.jsx
"use client";

import { useState, useEffect } from "react";
import AddProductForm from "@/app/components/AddProductsForm/AddProductsForm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Add_Staff_Form from "@/app/components/Add_Staff_Form/Add_Staff_Form";
import { 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  Trash2, 
  Package, 
  Mail, 
  Save, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";

const CATEGORIES_LIST = [
  { group: "Charging", items: [
    { label: "Micro cable", value: "micro-cable" },
    { label: "Type-C Cable", value: "type-c-cable" },
    { label: "Lightning Cable", value: "lightning-cable" },
    { label: "Fast Charger", value: "fast-charger" },
    { label: "Wireless Charger", value: "wireless-charger" },
    { label: "Car Charger", value: "car-charger" },
    { label: "Multi-port Charger", value: "multi-port-charger" },
  ]},
  { group: "Audio", items: [
    { label: "TWS Earbuds", value: "tws-earbuds" },
    { label: "Neckband", value: "neckband" },
    { label: "Wired Earphones", value: "wired-earphones" },
    { label: "Bluetooth Headphones", value: "bluetooth-headphones" },
    { label: "Portable Speaker", value: "portable-speaker" },
    { label: "AUX Cable", value: "aux-cable" },
  ]},
  { group: "Power & Battery", items: [
    { label: "Power Bank", value: "power-bank" },
    { label: "Battery", value: "battery" },
    { label: "Battery Charger", value: "battery-charger" },
    { label: "Wireless Power Bank", value: "wireless-power-bank" },
  ]},
  { group: "Stands & Holders", items: [
    { label: "Desk Mobile Stand", value: "desk-mobile-stand" },
    { label: "Car Mobile Holder", value: "car-mobile-holder" },
    { label: "Bike Mobile Holder", value: "bike-mobile-holder" },
    { label: "Magnetic Holder", value: "magnetic-holder" },
    { label: "Flexible Mobile Stand", value: "flexible-mobile-stand" },
  ]},
  { group: "Adapters & Converters", items: [
    { label: "OTG Cable", value: "otg-cable" },
    { label: "Type-C to USB Converter", value: "type-c-to-usb-converter" },
    { label: "Type-C to 3.5mm Converter", value: "type-c-to-3.5mm-converter" },
    { label: "HDMI Adapter", value: "hdmi-adapter" },
    { label: "USB Hub", value: "usb-hub" },
    { label: "Card Reader", value: "card-reader" },
  ]},
  { group: "Smart Gadgets", items: [
    { label: "Smartwatch", value: "smartwatch" },
    { label: "Fitness Band", value: "fitness-band" },
    { label: "Smart Tag", value: "smart-tag" },
    { label: "Bluetooth Tracker", value: "bluetooth-tracker" },
    { label: "Smart LED Gadgets", value: "smart-led-gadgets" },
  ]},
  { group: "Vlogging & Photography", items: [
    { label: "Selfie Stick", value: "selfie-stick" },
    { label: "Tripod", value: "tripod" },
    { label: "Ring Light", value: "ring-light" },
    { label: "Mobile Lens", value: "mobile-lens" },
    { label: "Phone Camera Accessories", value: "phone-camera-accessories" },
  ]},
  { group: "Gaming", items: [
    { label: "Mobile Gaming Controller", value: "mobile-gaming-controller" },
    { label: "Gaming Trigger", value: "gaming-trigger" },
    { label: "Gaming Finger Sleeve", value: "gaming-finger-sleeve" },
    { label: "Mobile Cooling Fan", value: "mobile-cooling-fan" },
    { label: "Gaming Headphones", value: "gaming-headphones" },
  ]}
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [notification, setNotification] = useState(null);

  const [contactForm, setContactForm] = useState({
    email: "",
    phone: "",
    workingHours: "",
    location: ""
  });
  const [currentContact, setCurrentContact] = useState(null);
  const [savingContact, setSavingContact] = useState(false);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  useEffect(() => {
    fetchProducts();
    fetchContactSettings();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/fetchProducts");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = () => {
    fetchProducts();
    showToast("Product added successfully!");
  };

  const fetchContactSettings = async () => {
    try {
      const res = await fetch("/api/admin/contact-settings");
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentContact(data.data);
        setContactForm({
          email: data.data.email || "",
          phone: data.data.phone || "",
          workingHours: data.data.workingHours || "",
          location: data.data.location || ""
        });
      }
    } catch (err) {
      console.error("Failed to fetch contact settings", err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/fetchProducts?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setProducts((prev) => prev.filter((product) => product._id !== id));
        showToast("Product deleted successfully!");
      } else {
        showToast("Failed to delete product: " + data.error, "error");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Error deleting product.", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/admin-login");
    } catch (err) {
      showToast("Failed to log out.", "error");
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await fetch("/api/admin/contact-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Contact details updated successfully!");
        fetchContactSettings();
      } else {
        showToast("Failed to update: " + data.error, "error");
      }
    } catch (err) {
      console.error("Error saving contact info", err);
      showToast("Error saving contact info.", "error");
    } finally {
      setSavingContact(false);
    }
  };

  const handleDeleteContactSettings = async () => {
    if (!confirm("Are you sure you want to delete stored contact details?")) return;

    try {
      const res = await fetch("/api/admin/contact-settings", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCurrentContact(null);
        setContactForm({ email: "", phone: "", workingHours: "", location: "" });
        showToast("Contact details deleted successfully!");
      } else {
        showToast("Failed to delete: " + data.error, "error");
      }
    } catch (err) {
      console.error("Error deleting contact settings", err);
      showToast("Error deleting contact settings.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col relative selection:bg-amber-400 selection:text-black">
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-semibold ${
            notification.type === "error" ? "bg-rose-950/90 border-rose-800 text-rose-200" : "bg-neutral-900 border-yellow-500/50 text-white"
          }`}>
            {notification.type === "error" ? <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      <header className="w-full bg-[#121212] border-b border-neutral-800 px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-400 text-neutral-900 rounded-xl font-bold">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Admin Command Center</h1>
            <p className="text-xs text-neutral-400">Manage catalog & support configuration</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 px-4 py-2.5 rounded-xl transition-colors cursor-pointer">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 bg-[#121212] border border-neutral-800 p-6 rounded-2xl shadow-xl space-y-8">
            <div>
              <div className="mb-6 flex items-center gap-2 border-b border-neutral-800 pb-4">
                <PlusCircle className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">Add New Product</h2>
              </div>
              <AddProductForm onProductAdded={handleProductAdded} categoriesList={CATEGORIES_LIST} />
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#121212] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <div className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">Existing Catalog</h2>
              </div>
              <span className="text-xs bg-neutral-800 text-yellow-400 px-3 py-1 rounded-full font-medium">
                {products.length} Items Total
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-neutral-500 text-sm">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
                <p className="text-neutral-400 text-sm font-medium">No products added yet.</p>
                <p className="text-neutral-600 text-xs mt-1">Use the left form to upload your first item.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
                {products.map((product) => (
                  <div key={product._id} className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl hover:border-yellow-400/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <img src={product.imageUrl} alt={product.title} className="w-14 h-14 object-cover rounded-lg bg-neutral-800 border border-neutral-700" />
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-yellow-400 transition-colors">
                          {product.title}
                        </h3>
                        <span className="inline-block text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded mt-0.5">
                          {product.category || "mobile-accessories"}
                        </span>
                        
                        {/* Dual Pricing Display: Strikethrough Original MRP in red followed by Selling Price */}
                        <div className="flex items-center gap-2.5 mt-1">
                          <span className="text-xs font-bold text-yellow-400">₹{product.price}</span>
                          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                            <span className="text-[11px] text-rose-500 line-through font-mono">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2.5 bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/30 cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="bg-[#121212] border border-neutral-800 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-white">Manage Contact & Support Details</h2>
            </div>
            {currentContact && (
              <button
                onClick={handleDeleteContactSettings}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Active Contact Info</span>
              </button>
            )}
          </div>

          {currentContact && (
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-neutral-500 block mb-1">Email</span>
                <span className="font-semibold text-white">{currentContact.email}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Phone</span>
                <span className="font-semibold text-white">{currentContact.phone}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Working Hours</span>
                <span className="font-semibold text-white">{currentContact.workingHours}</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">Location</span>
                <span className="font-semibold text-white">{currentContact.location}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">Company Support Email</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="support@caseo.in"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">Customer Care Phone</label>
              <input
                type="text"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="+91 (987) 654-3210"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">Working Hours Text</label>
              <input
                type="text"
                value={contactForm.workingHours}
                onChange={(e) => setContactForm({ ...contactForm, workingHours: e.target.value })}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="Mon - Sat: 10 AM - 7 PM"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300">Fulfillment Location / Hub</label>
              <input
                type="text"
                value={contactForm.location}
                onChange={(e) => setContactForm({ ...contactForm, location: e.target.value })}
                required
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
                placeholder="India"
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingContact}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-neutral-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-yellow-400/20 disabled:opacity-50 text-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingContact ? "Saving..." : "Save Contact Info"}</span>
              </button>
            </div>
          </form>
        </div>

        <Add_Staff_Form />

      </main>
    </div>
  );
}