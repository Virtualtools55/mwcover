// components/Navbar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Home,
  Compass,
  ShoppingBag,
  Package,
  User,
  Info,
  PhoneCall,
  Menu,
  X,
  HelpCircle
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Core Bottom Nav Items (Max 5 items for mobile dock)
  const primaryNavLinks = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Explore", href: "/explore", icon: <Compass className="w-5 h-5" /> },
    { name: "Cart", href: "/cart", icon: <ShoppingBag className="w-5 h-5" /> },
    { name: "Orders", href: "/orders", icon: <Package className="w-5 h-5" /> },
    { name: "Account", href: "/account", icon: <User className="w-5 h-5" /> },
  ];

  // Secondary Clean & Direct Links
  const secondaryNavLinks = [
    { name: "About Us", href: "/about", icon: <Info className="w-4 h-4 text-amber-400" /> },
    { name: "Info & FAQs", href: "/info", icon: <HelpCircle className="w-4 h-4 text-amber-400" /> },
    { name: "Contact Us", href: "/contact", icon: <PhoneCall className="w-4 h-4 text-amber-400" /> },
  ];

  const desktopNavLinks = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/explore" },
    { name: "Cart", href: "/cart" },
    { name: "Orders", href: "/orders" },
    { name: "About", href: "/about" },
    { name: "Info", href: "/info" },
    { name: "Contact", href: "/contact" },
    { name: "Account", href: "/account" },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMoreMenuOpen(false);
      }
    }
    if (moreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreMenuOpen]);

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}
      <header className="hidden md:flex sticky top-0 z-50 w-full bg-[#0B0B0B] backdrop-blur-xl border-b border-zinc-800 px-10 py-4 items-center justify-between shadow-md">
        <Link href="/" className="group flex flex-col items-center justify-center leading-none">
          <img
            src="/caseologo.png"
            alt="Caseo Logo"
            className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <div className="mt-1 flex items-center justify-center gap-1.5 whitespace-nowrap">
            <span className="text-[9px] leading-none font-semibold text-zinc-300 group-hover:text-yellow-400 transition-colors duration-200">
              केसियो
            </span>
            <span className="text-[8px] leading-none text-zinc-600">•</span>
            <span className="text-[8px] leading-none font-medium tracking-wide text-zinc-500">
              Carry Your Vibe.
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800 shadow-sm">
          {desktopNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-full transition-all ${
                  isActive 
                    ? "bg-yellow-400 text-neutral-950 shadow-sm scale-105" 
                    : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                }`}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/cart"
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-neutral-950 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-neutral-950" />
          <span>Bag</span>
        </Link>
      </header>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="md:hidden sticky top-0 z-45 w-full bg-[#0B0B0B]/95 backdrop-blur-xl border-b border-neutral-800 px-5 py-3 flex items-center justify-between shadow-lg">
        <Link href="/" className="group flex flex-col items-center justify-center leading-none">
          <img src="/caseologo.png" alt="Caseo Logo" className="h-10 w-auto object-contain" />
          <div className="mt-1 flex items-center justify-center gap-1 whitespace-nowrap">
            <span className="text-[8px] leading-none font-semibold text-zinc-300">केसियो</span>
            <span className="text-[7px] leading-none text-zinc-600">•</span>
            <span className="text-[7px] leading-none font-medium tracking-wide text-zinc-500">Carry Your Vibe.</span>
          </div>
        </Link>

        <Link
          href="/cart"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-full text-[11px] font-bold shadow-md transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-neutral-950" />
          <span>Bag</span>
        </Link>
      </header>

      {/* ================= MOBILE FLOATING APP DOCK WITH SIMPLE POPOVER ================= */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-50" ref={menuRef}>
        
        {/* Simple Popover Menu */}
        {moreMenuOpen && (
          <div className="absolute bottom-16 right-0 w-52 bg-[#121212] border border-neutral-800 rounded-2xl p-2 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-1">
            <div className="px-3 py-1.5 flex items-center justify-between border-b border-neutral-800/80 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Menu Options
              </span>
              <button 
                onClick={() => setMoreMenuOpen(false)}
                className="text-neutral-500 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {secondaryNavLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMoreMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? "bg-amber-400 text-neutral-950 font-bold" 
                      : "text-neutral-300 hover:bg-neutral-800/80 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom Dock Bar */}
        <nav className="bg-[#121212]/95 text-white backdrop-blur-2xl border border-neutral-800 px-2 py-1.5 flex items-center justify-around rounded-3xl shadow-2xl">
          {primaryNavLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
                  isActive 
                    ? "text-yellow-400 font-bold scale-105 bg-yellow-400/10" 
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>{link.icon}</span>
                <span className="text-[10px] mt-1 tracking-tight font-medium">
                  {link.name}
                </span>
              </Link>
            );
          })}

          {/* Clean More Button */}
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              moreMenuOpen ? "text-amber-400 bg-amber-400/10 font-bold scale-105" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight font-medium">More</span>
          </button>
        </nav>
      </div>
    </>
  );
}