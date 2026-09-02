"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Home,
  Compass, 
  ShoppingBag, 
  Package, 
  User, 
  Menu, 
  X,
  Sparkles
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Navigation Links Data
  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Explore", href: "/explore", icon: <Compass className="w-5 h-5" /> },
    { name: "Cart", href: "/cart", icon: <ShoppingBag className="w-5 h-5" /> },
    { name: "Orders", href: "/orders", icon: <Package className="w-5 h-5" /> },
    { name: "Account", href: "/account", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}
      <header className="hidden md:flex sticky top-0 z-50 w-full bg-[#0B0B0B]/90 backdrop-blur-xl border-b border-neutral-800 px-10 py-4 items-center justify-between transition-all shadow-lg">
        <Link href="/" className="text-xl font-black tracking-tighter text-white flex items-center gap-1.5 group">
          <span>COVER</span>
        </Link>

        <nav className="flex items-center gap-8 bg-neutral-900/90 px-6 py-2 rounded-full border border-neutral-800 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-yellow-400 transition-colors"
            >
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-full text-xs font-bold shadow-md transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-neutral-950" />
          <span>Bag</span>
        </Link>
      </header>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="md:hidden sticky top-0 z-45 w-full bg-[#0B0B0B]/90 backdrop-blur-xl border-b border-neutral-800 px-5 py-3.5 flex items-center justify-between shadow-lg">
        <Link href="/" className="text-lg font-black tracking-tighter text-white flex items-center gap-1.5 group">
          <span>COVER</span>
        </Link>

        <Link
          href="/cart"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-full text-[11px] font-bold shadow-md transition-all"
        >
          <ShoppingBag className="w-3 h-3 text-neutral-950" />
          <span>Bag</span>
        </Link>
      </header>

      {/* ================= MOBILE FLOATING BOTTOM NAVBAR ================= */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 text-white backdrop-blur-2xl border border-white/10 px-6 py-3 flex items-center gap-6 rounded-3xl shadow-2xl">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-white transition-colors focus:outline-none group"
          aria-label="Open Menu"
        >
          <div className="p-1 rounded-full group-hover:bg-white/10 transition-all">
            <Menu className="w-5 h-5 text-yellow-400" />
          </div>
          <span className="text-xs font-extrabold tracking-wide text-yellow-400">Menu</span>
        </button>
      </div>

      {/* ================= MOBILE DARK LUXURY GLASS MODAL ================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-xs bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800 shadow-2xl rounded-3xl p-6 flex flex-col items-center animate-in fade-in zoom-in duration-200">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              aria-label="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">
                Menu / Cover
              </h3>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-neutral-800/60 hover:bg-yellow-400 hover:text-neutral-950 text-neutral-200 font-bold text-xs transition-all shadow-sm border border-neutral-700/50 group"
                >
                  <span className="text-yellow-400 group-hover:text-neutral-950 transition-colors">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}