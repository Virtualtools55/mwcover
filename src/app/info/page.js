// app/info/page.js
export default function InfoPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-zinc-900 py-14 px-6 md:px-12 selection:bg-yellow-400 selection:text-zinc-950">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="border-b border-zinc-200 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 bg-white border border-zinc-200/80 px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-zinc-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            <span>Legal & Guarantees</span>
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">Store Info</h1>
          <p className="text-xs text-zinc-500 max-w-lg leading-relaxed">
            Transparent guidelines on our cancellation windows, secure refunds, and swift doorstep shipping.
          </p>
        </div>

        <section className="bg-white border border-zinc-200/80 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-lg hover:shadow-yellow-300/50 hover:border-yellow-400 transition-all">
          <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-zinc-950 font-mono font-bold text-xs">01</span>
          </div>
          <h2 className="text-base font-bold text-zinc-900">Cancellation & Refund Policy</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            You can cancel your order directly from your profile dashboard within <strong className="text-zinc-900 font-bold">30 minutes</strong> of placing it. 
          </p>
          <p className="text-xs text-zinc-600 leading-relaxed">
            For cancelled orders or approved returns, refunds are automatically processed back to your original payment method and reflect in your account within <strong className="text-zinc-900 font-bold">3-5 working days</strong>.
          </p>
        </section>

        <section className="bg-white border border-zinc-200/80 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-lg hover:shadow-yellow-300/50 hover:border-yellow-400 transition-all">
          <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-zinc-950 font-mono font-bold text-xs">02</span>
          </div>
          <h2 className="text-base font-bold text-zinc-900">Shipping & Transit</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            All mobile cover orders are packaged with protective shock-proof layers and dispatched rapidly. Standard doorstep delivery takes <strong className="text-zinc-900 font-bold">3–7 working days</strong> depending on your destination pin code.
          </p>
        </section>

        <section className="bg-white border border-zinc-200/80 rounded-3xl p-8 space-y-4 shadow-sm hover:shadow-lg hover:shadow-yellow-300/50 hover:border-yellow-400 transition-all">
          <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-zinc-950 font-mono font-bold text-xs">03</span>
          </div>
          <h2 className="text-base font-bold text-zinc-900">Privacy & Protection</h2>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Your personal data, contact information, and payment transactions are secured with advanced encryption layers. We value your privacy above all.
          </p>
        </section>
      </div>
    </div>
  );
}