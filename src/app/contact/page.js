// app/contact/page.js
import { Mail, Phone, MapPin, Clock, Headphones } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-zinc-900 py-14 px-6 md:px-12 selection:bg-yellow-400 selection:text-zinc-950">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-white border border-zinc-200/80 px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-zinc-700 shadow-xs">
            <Headphones className="w-3 h-3 text-yellow-400" />
            <span>Support Desk</span>
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-zinc-900">Get in Touch</h1>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">Have questions about your mobile cover order, shipping updates, or custom queries? We're ready to help.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-3 flex items-start gap-4 shadow-sm hover:shadow-lg hover:shadow-yellow-300/50 hover:border-yellow-400 transition-all">
            <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <Mail className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Company Email</h3>
              <a href="mailto:support@yourdomain.com" className="inline-block text-xs text-zinc-900 mt-1 font-mono font-bold hover:text-yellow-400 transition-colors">
                support@yourdomain.com
              </a>
              <p className="text-[10px] text-zinc-400 mt-0.5">Response within 24 hours</p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-3 flex items-start gap-4 shadow-sm hover:shadow-lg hover:shadow-yellow-300/50 hover:border-yellow-400 transition-all">
            <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <Phone className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Customer Care</h3>
              <a href="tel:+919876543210" className="inline-block text-xs text-zinc-900 mt-1 font-mono font-bold hover:text-yellow-400 transition-colors">
                +91 (987) 654-3210
              </a>
              <p className="text-[10px] text-zinc-400 mt-0.5">Mon - Sat: 10 AM - 7 PM</p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-3 flex items-start gap-4 shadow-sm hover:shadow-lg hover:shadow-yellow-300/50 hover:border-yellow-400 transition-all">
            <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <Clock className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Working Days</h3>
              <p className="text-xs text-zinc-900 mt-1 font-medium">Monday through Saturday</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Fast dispatch & order processing</p>
            </div>
          </div>

          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 space-y-3 flex items-start gap-4 shadow-sm hover:shadow-lg hover:shadow-yellow-300/50 hover:border-yellow-400 transition-all">
            <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shrink-0 shadow-md">
              <MapPin className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Fulfillment Hub</h3>
              <p className="text-xs text-zinc-900 mt-1 font-medium">India</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Pan-India express delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}