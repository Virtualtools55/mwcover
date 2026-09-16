// app/delivery/layout.js
import { headers } from "next/headers";
import connectDB from "@/lib/db";
import AllowedIP from "@/models/AllowedIp";

export default async function DeliveryLayout({ children }) {
  await connectDB();

  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");
  let clientIp = forwarded ? forwarded.split(",")[0].trim() : (realIp || "127.0.0.1");

  if (clientIp.startsWith("::ffff:")) {
    clientIp = clientIp.replace("::ffff:", "");
  }

  // डेटाबेस में चेक करें कि क्या यह IP एप्रूव्ड है
  const allowedDoc = await AllowedIP.findOne({ ip: clientIp });

  if (!allowedDoc) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-rose-50 p-5 rounded-full border border-rose-200 mb-4 shadow-sm">
          <svg className="w-12 h-12 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">Access Denied</h1>
        <p className="text-xs text-stone-500 max-w-sm">
          Your IP address (<strong className="text-stone-800">{clientIp}</strong>) is not authorized for delivery management.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}