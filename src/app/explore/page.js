"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowUpRight, Compass, ChevronRight } from "lucide-react";

export default function ExplorePage() {
  const categories = [
    {
      title: "Charging",
      subcategories: [
        "USB Cable",
        "Type-C Cable",
        "Lightning Cable",
        "Micro USB Cable",
        "Fast Charger",
        "Wireless Charger",
        "Car Charger",
        "Multi-port Charger",
      ],
    },
    {
      title: "Earphones & Audio",
      subcategories: [
        "TWS Earbuds",
        "Neckband",
        "Wired Earphones",
        "Bluetooth Headphones",
        "Portable Speaker",
        "AUX Cable",
      ],
    },
    {
      title: "Mobile Covers & Protection",
      subcategories: [
        "Mobile Cover",
        "Back Cover",
        "Silicone Cover",
        "Transparent Cover",
        "Screen Protector",
        "Tempered Glass",
        "Camera Lens Protector",
      ],
    },
    {
      title: "Power & Battery",
      subcategories: [
        "Power Bank",
        "Battery",
        "Battery Charger",
        "Wireless Power Bank",
      ],
    },
    {
      title: "Mobile Stands & Mounts",
      subcategories: [
        "Desk Mobile Stand",
        "Car Mobile Holder",
        "Bike Mobile Holder",
        "Magnetic Holder",
        "Flexible Mobile Stand",
      ],
    },
    {
      title: "Cables & Converters",
      subcategories: [
        "OTG Cable",
        "Type-C to USB Converter",
        "Type-C to 3.5mm Converter",
        "HDMI Adapter",
        "USB Hub",
        "Card Reader",
      ],
    },
    {
      title: "Smart Gadgets",
      subcategories: [
        "Smartwatch",
        "Fitness Band",
        "Smart Tag",
        "Bluetooth Tracker",
        "Smart LED Gadgets",
      ],
    },
    {
      title: "Selfie & Mobile Photography",
      subcategories: [
        "Selfie Stick",
        "Tripod",
        "Ring Light",
        "Mobile Lens",
        "Phone Camera Accessories",
      ],
    },
    {
      title: "Gaming Accessories",
      subcategories: [
        "Mobile Gaming Controller",
        "Gaming Trigger",
        "Gaming Finger Sleeve",
        "Mobile Cooling Fan",
        "Gaming Headphones",
      ],
    },
    {
      title: "Other Accessories",
      subcategories: [
        "SIM Card Holder/Adapter",
        "Mobile Cleaning Kit",
        "Cable Organizer",
        "Mobile Pouch",
        "Mobile Ring",
        "Screen Cleaning Items",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 px-4 sm:px-8 py-12 pb-28">
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1.5 bg-yellow-400/20 border border-yellow-400/40 rounded-xl text-yellow-600">
            <Compass className="w-4 h-4" />
          </span>
          <span className="text-[10px] tracking-widest font-extrabold uppercase bg-neutral-100 text-neutral-900 px-3 py-1 rounded-full border border-neutral-200">
            Full Catalog Directory
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900">
          Explore All Categories.
        </h1>
        <p className="text-neutral-500 text-xs sm:text-sm mt-2 max-w-lg">
          Browse through our complete collection of mobile accessories and precision gear.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className="bg-neutral-50/80 border border-neutral-200 hover:border-yellow-400 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-yellow-400/10"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-white text-neutral-900 px-3 py-1 rounded-full border border-neutral-200 shadow-sm">
                  {cat.subcategories.length} Items
                </span>
                <span className="p-2 bg-white text-neutral-700 rounded-2xl border border-neutral-200 shadow-xs">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-neutral-900 mb-4">
                {cat.title}
              </h3>
              
              <ul className="flex flex-col gap-2 mb-6">
                {cat.subcategories.map((sub) => (
                  <li key={sub}>
                    <Link
                      href={`/categories/${sub.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="text-xs font-semibold text-neutral-600 hover:text-yellow-600 flex items-center gap-2 transition-colors py-1 group"
                    >
                      <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:text-yellow-500 transition-colors" />
                      <span>{sub}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-neutral-200/80 flex items-center justify-between text-xs font-bold text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                <span>Explore Section</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}