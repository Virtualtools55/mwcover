// app/components/Navbar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home,
  Compass, 
  ShoppingBag, 
  Package, 
  User, 
  Info,
  PhoneCall
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  // Navigation Links Data
  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
    { name: "Explore", href: "/explore", icon: <Compass className="w-5 h-5" /> },
    { name: "Cart", href: "/cart", icon: <ShoppingBag className="w-5 h-5" /> },
    { name: "Orders", href: "/orders", icon: <Package className="w-5 h-5" /> },
    { name: "About", href: "/about", icon: <Info className="w-5 h-5" /> },
    { name: "Info", href: "/info", icon: <Info className="w-5 h-5" /> },
    { name: "Contact", href: "/contact", icon: <PhoneCall className="w-5 h-5" /> },
    { name: "Account", href: "/account", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* ================= DESKTOP NAVBAR ================= */}
      <header className="hidden md:flex sticky top-0 z-50 w-full bg-[#0B0B0B] backdrop-blur-xl border-b border-zinc-800 px-10 py-4 items-center justify-between transition-all shadow-md">
        <Link href="/" className="text-xl font-serif font-bold tracking-tight text-white flex items-center gap-1.5 group">
          <span>MWCover</span>
        </Link>

        {/* Menu Links with Yellow Hover/Active Pill and Black Text */}
        <nav className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                  isActive 
                    ? "bg-yellow-400 text-zinc-950 shadow-sm scale-105" 
                    : "text-zinc-700 hover:bg-yellow-100 hover:text-zinc-950"
                }`}
              >
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/cart"
          className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-zinc-950 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-zinc-950" />
          <span>Bag</span>
        </Link>
      </header>

      {/* ================= MOBILE TOP HEADER (ONLY BRAND NAME & BAG ICON) ================= */}
      <header className="md:hidden sticky top-0 z-45 w-full bg-[#0B0B0B]/95 backdrop-blur-xl border-b border-neutral-800 px-5 py-3.5 flex items-center justify-between shadow-lg">
        <Link href="/" className="text-lg font-serif font-bold tracking-tight text-white flex items-center gap-1.5 group">
          <span>MWCover</span>
        </Link>

        <Link
          href="/cart"
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-neutral-950 rounded-full text-[11px] font-bold shadow-md transition-all cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-neutral-950" />
          <span>Bag</span>
        </Link>
      </header>

      {/* ================= MOBILE BOTTOM APP DOCK (FIXED APP-LIKE NAVIGATION) ================= */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 z-50 bg-neutral-900/98 text-white backdrop-blur-2xl border border-white/15 px-3 py-2 flex items-center justify-between rounded-3xl shadow-2xl">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all ${
                isActive ? "text-yellow-400 font-bold scale-105" : "text-white hover:text-yellow-300"
              }`}
            >
              <span className={`transition-transform ${isActive ? "text-yellow-400" : "text-white"}`}>
                {link.icon}
              </span>
              <span className="text-[9px] mt-1 tracking-tight">{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}