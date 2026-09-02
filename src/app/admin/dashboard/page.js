"use client";

import { useState, useEffect } from "react";
import AddProductForm from "@/app/components/AddProductsForm/AddProductsForm";
import Link from "next/link";
import { LayoutDashboard, PlusCircle, LogOut, Trash2, Package } from "lucide-react";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/fetchProducts");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this mobile cover?")) return;

    try {
      const res = await fetch(`/api/admin/fetchProducts?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setProducts((prev) => prev.filter((product) => product._id !== id));
      } else {
        alert("Failed to delete product: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col">
      <header className="w-full bg-[#121212] border-b border-neutral-800 px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-400 text-neutral-900 rounded-xl font-bold">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Admin Dashboard</h1>
            <p className="text-xs text-neutral-400">Manage store catalog & ImageKit inventory</p>
          </div>
        </div>

        <Link
          href="/admin"
          className="flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 px-4 py-2.5 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Link>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 bg-[#121212] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <div className="mb-6 flex items-center gap-2 border-b border-neutral-800 pb-4">
              <PlusCircle className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-white">Add New Mobile Cover</h2>
            </div>
            <AddProductForm onProductAdded={fetchProducts} />
          </div>

          <div className="lg:col-span-7 bg-[#121212] border border-neutral-800 p-6 rounded-2xl shadow-xl">
            <div className="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">Existing Catalog</h2>
              </div>
              <span className="text-xs bg-neutral-800 text-yellow-400 px-3 py-1 rounded-full font-medium">
                {products.length} Items Total
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-neutral-500 text-sm">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-neutral-800 rounded-xl">
                <p className="text-neutral-400 text-sm font-medium">No mobile covers added yet.</p>
                <p className="text-neutral-600 text-xs mt-1">Use the left form to upload your first item.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[650px] overflow-y-auto pr-2">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-xl hover:border-yellow-400/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-14 h-14 object-cover rounded-lg bg-neutral-800 border border-neutral-700"
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-yellow-400 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-xs font-bold text-yellow-400 mt-0.5">₹{product.price}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="p-2.5 bg-neutral-800 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 rounded-lg transition-colors border border-transparent hover:border-rose-500/30"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}