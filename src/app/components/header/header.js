// app/components/Navbar.jsx
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
  Sparkles,
  Info,
  PhoneCall
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Navigation Links Data with Info, About, and Contact
  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Explore", href: "/explore", icon: <Compass className="w-5 h-5" /> },
    { name: "Cart", href: "/cart", icon: <ShoppingBag className="w-5 h-5" /> },
    { name: "Orders", href: "/orders", icon: <Package className="w-5 h-5" /> },
    { name: "About Us", href: "/about", icon: <Info className="w-5 h-5" /> },
    { name: "Info", href: "/info", icon: <Info className="w-5 h-5" /> },
    { name: "Contact", href: "/contact", icon: <PhoneCall className="w-5 h-5" /> },
    { name: "Account", href: "/account", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}
      <header className="hidden md:flex sticky top-0 z-50 w-full bg-[#FAF9F5]/90 backdrop-blur-xl border-b border-zinc-200/80 px-10 py-4 items-center justify-between transition-all shadow-sm">
        <Link href="/" className="text-xl font-serif font-bold tracking-tight text-zinc-900 flex items-center gap-1.5 group">
          <span>MWCover</span>
        </Link>

        <nav className="flex items-center gap-6 bg-white px-6 py-2 rounded-full border border-zinc-200/80 shadow-xs">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-yellow-400 transition-colors"
            >
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 rounded-full text-xs font-bold shadow-md transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-zinc-950" />
          <span>Bag</span>
        </Link>
      </header>

      {/* ================= MOBILE TOP HEADER (BLACK) ================= */}
      <header className="md:hidden sticky top-0 z-45 w-full bg-[#0B0B0B]/90 backdrop-blur-xl border-b border-neutral-800 px-5 py-3.5 flex items-center justify-between shadow-lg">
        <Link href="/" className="text-lg font-serif font-bold tracking-tight text-white flex items-center gap-1.5 group">
          <span>MWCover</span>
        </Link>

        <Link
          href="/cart"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-full text-[11px] font-bold shadow-md transition-all"
        >
          <ShoppingBag className="w-3 h-3 text-neutral-950" />
          <span>Bag</span>
        </Link>
      </header>

      {/* ================= MOBILE FLOATING BOTTOM NAVBAR (BLACK) ================= */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/95 text-white backdrop-blur-2xl border border-white/10 px-6 py-3 flex items-center gap-6 rounded-3xl shadow-2xl">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-white transition-colors focus:outline-none group cursor-pointer"
          aria-label="Open Menu"
        >
          <div className="p-1 rounded-full group-hover:bg-white/10 transition-all">
            <Menu className="w-5 h-5 text-yellow-400" />
          </div>
          <span className="text-xs font-extrabold tracking-wide text-yellow-400">Menu</span>
        </button>
      </div>

      {/* ================= MOBILE LIGHT LUXURY GLASS MODAL (WHITE THEME) ================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-xs bg-[#FAF9F5] backdrop-blur-2xl border border-zinc-200/80 shadow-2xl rounded-3xl p-6 flex flex-col items-center animate-in fade-in zoom-in duration-200 max-h-[85vh] overflow-y-auto">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-200/80 hover:bg-zinc-300 text-zinc-800 transition-colors cursor-pointer"
              aria-label="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-zinc-900">
                Menu / MWCover
              </h3>
            </div>

            <div className="w-full flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-white hover:bg-yellow-400 hover:text-zinc-950 text-zinc-800 font-bold text-xs transition-all shadow-xs border border-zinc-200/80 group"
                >
                  <span className="text-yellow-400 group-hover:text-zinc-950 transition-colors">{link.icon}</span>
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