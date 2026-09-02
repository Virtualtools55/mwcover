"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";

export default function AddProductForm({ onProductAdded }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !image) {
      setMessage("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", price);
      formData.append("image", image);

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Product added successfully!");
        setTitle("");
        setPrice("");
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
            placeholder="e.g. Matte Black Minimal Case"
            className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400 text-sm transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
            Price (₹)
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
              <span>Save Mobile Cover</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}