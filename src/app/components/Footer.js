// components/Footer.jsx
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-neutral-900 text-white py-12 px-6 md:px-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-900">
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg tracking-tight text-white">MWCover</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            High-contrast, shock-proof aesthetic mobile covers designed for your everyday carry.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li><Link href="/" className="hover:text-yellow-400 transition-colors">Store</Link></li>
            <li><Link href="/about" className="hover:text-yellow-400 transition-colors">About Us</Link></li>
            <li><Link href="/orders" className="hover:text-yellow-400 transition-colors">Your Orders</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Customer Care</h4>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li><Link href="/contact" className="hover:text-yellow-400 transition-colors">Contact Us</Link></li>
            <li><Link href="/info" className="hover:text-yellow-400 transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/info" className="hover:text-yellow-400 transition-colors">Cancellation Policy</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Assurance</h4>
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80 space-y-1">
            <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              3-5 Day Refunds
            </p>
            <p className="text-[10px] text-neutral-400">Instant 30-minute cancellation window on all paid orders.</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
        <p>&copy; {new Date().getFullYear()} MWCover. All rights reserved.</p>
      </div>
    </footer>
  );
}