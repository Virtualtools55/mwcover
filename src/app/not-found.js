// app/not-found.jsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 p-8 shadow-xl text-center">
        <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center mx-auto mb-6 text-neutral-900">
          <FileQuestion className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black tracking-tight text-neutral-900 mb-2">Page Not Found</h1>
        <p className="text-xs text-neutral-500 font-medium mb-8 leading-relaxed">
          The page you are looking for might have been removed, renamed, or doesn't exist.
        </p>

        <div className="space-y-3">
          <Link
            href="/account"
            className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Account</span>
          </Link>

          <button
            onClick={() => router.back()}
            className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}