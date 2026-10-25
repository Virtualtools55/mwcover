// app/delivery/layout.js
import { headers } from "next/headers";
import connectDB from "@/lib/db";

export default async function DeliveryLayout({ children }) {
  await connectDB();

  // IP check restriction hata di gayi hai, ab saare authenticated users access kar sakte hain.
  return <>{children}</>;
}