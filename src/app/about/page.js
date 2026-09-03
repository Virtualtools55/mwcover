// app/about/page.js
import Link from "next/link";
import { Sparkles, Shield, Zap, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-zinc-900 py-14 px-6 md:px-12 selection:bg-yellow-400 selection:text-zinc-950">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white border border-zinc-200/80 px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-zinc-700 shadow-xs">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>Vision & Craftsmanship</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-zinc-900">
            Redefining Mobile Armor
          </h1>
          <p className="text-xs text-zinc-600 max-w-lg mx-auto leading-relaxed">
            We build premium, shock-proof mobile covers featuring clean white surfaces, sleek black contours, and vibrant yellow accents — offering high-end design without the high-end price tag.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200/80 p-8 rounded-3xl space-y-4 shadow-sm hover:shadow-lg hover:shadow-yellow-300/50 hover:border-yellow-400 transition-all">
            <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-zinc-950" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Maximum Drop Protection</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Engineered with dual-layer shock-absorption technology to keep your device safe from accidental slips, drops, and everyday friction.
            </p>
          </div>

          <div className="bg-white border border-zinc-200/80 p-8 rounded-3xl space-y-4 shadow-sm hover:shadow-lg hover:shadow-yellow-300/50 hover:border-yellow-400 transition-all">
            <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-zinc-950" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Affordable Luxury</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              We cut out middleman markups to bring your favorite aesthetic phone covers directly to your doorstep at breakthrough prices.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 text-white rounded-3xl p-8 md:p-10 text-center space-y-4 shadow-md">
          <h2 className="text-2xl font-serif font-bold tracking-tight">Upgrade your daily carry today</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto font-medium">Explore our curated lineup of high-contrast, minimalist mobile covers.</p>
          <div>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 rounded-2xl text-xs font-bold transition-all shadow-sm">
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}