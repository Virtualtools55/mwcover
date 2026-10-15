"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";

// All Categories list for dropdown selection
const CATEGORIES_LIST = [
  { group: "Mobile Covers", items: [{ label: "Mobile Covers", value: "mobile-cover" }] },
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

export default function AddProductForm({ onProductAdded }) {
  const [title, setTitle] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("mobile-cover");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !originalPrice || !price || !category || !image) {
      setMessage("Please fill out all fields including category.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("originalPrice", originalPrice);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("image", image);

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Product added successfully!");
        setTitle("");
        setOriginalPrice("");
        setPrice("");
        setCategory("mobile-cover");
        setImage(null);
        e.target.reset();
        if (onProductAdded) onProductAdded();
      } else {
        setMessage(data.error || "Failed to add product.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {message && (
        <div className={`p-3 mb-4 rounded-xl text-xs font-semibold ${message.includes("success") ? "bg-emerald-950/50 text-emerald-400 border border-emerald-800/50" : "bg-rose-950/50 text-rose-400 border border-rose-800/50"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Product Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Matte Black Minimal Case / Fast Charger"
            className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400 text-sm transition-colors"
            required
          />
        </div>

        {/* Category Selection Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-yellow-400 mb-1.5">
            Select Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-yellow-400 text-sm transition-colors cursor-pointer"
            required
          >
            {CATEGORIES_LIST.map((groupObj, idx) => (
              <optgroup key={idx} label={groupObj.group} className="bg-neutral-900 text-yellow-400 font-bold">
                {groupObj.items.map((item) => (
                  <option key={item.value} value={item.value} className="bg-neutral-900 text-white font-normal">
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Dual Pricing Inputs Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 line-through">
              Original MRP (₹)
            </label>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="999"
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400 text-sm transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-yellow-400 mb-1.5">
              Selling Price (₹)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="499"
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400 text-sm transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full text-xs text-neutral-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-neutral-800 file:text-yellow-400 hover:file:bg-neutral-700 cursor-pointer border border-neutral-700 rounded-xl bg-neutral-900 p-1"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading to ImageKit...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Save Product</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}