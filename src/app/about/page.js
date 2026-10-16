// app/about/page.jsx
"use client";

import Link from "next/link";
import { Sparkles, Zap, ShieldCheck, ArrowRight, Cpu } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 px-4 sm:px-8 py-12 pb-28 selection:bg-amber-400 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-bold tracking-wide uppercase text-neutral-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>The Caseo Vibe</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900">
            Elevate Your Everyday Tech.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto font-medium leading-relaxed">
            We aren&apos;t just selling accessories. We&apos;re curating high-vibe mobile gear, precision drops, and aesthetic protection built for the modern generation.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl space-y-3 shadow-xs hover:border-neutral-400 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 text-black fill-black" />
            </div>
            <h3 className="text-sm font-black tracking-tight">Gen Z Aesthetics</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              From matte transparent covers to high-speed charging gear, designed to match your vibe and daily carry.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl space-y-3 shadow-xs hover:border-neutral-400 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-sm font-black tracking-tight">Bulletproof Quality</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              Every drop goes through rigorous testing. Drop-proof protection meets zero-compromise sleek profile.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl space-y-3 shadow-xs hover:border-neutral-400 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <h3 className="text-sm font-black tracking-tight">Smart Tech Gear</h3>
            <p className="text-xs text-neutral-500 leading-relaxed font-medium">
              TWS earbuds, GaN fast chargers, gaming triggers, and precision mounts engineered for performance.
            </p>
          </div>
        </div>

        {/* Mission / MOQ Banner */}
        <div className="bg-neutral-900 text-white p-8 sm:p-10 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Direct to Consumer Drop
            </span>
            <h2 className="text-xl sm:text-2xl font-black">Built on Minimum Quantity Value</h2>
            <p className="text-xs text-neutral-400 max-w-md font-medium leading-relaxed">
              To bring you unmatched direct pricing and exclusive gear drops, we enforce a strict Minimum Order Quantity (MOQ) of 3 items across all orders. Stock up your setup.
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-2xl text-xs font-bold transition-all shrink-0 shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Explore Drops</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

      </div>
    </div>
  );
}