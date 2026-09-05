// app/api/admin/contact-settings/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ContactSettings from "@/models/ContactSettings";

export async function GET() {
  try {
    await connectDB();
    const settings = await ContactSettings.findOne();
    return NextResponse.json({ success: true, data: settings });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, phone, workingHours, location } = body;

    let settings = await ContactSettings.findOne();
    if (settings) {
      settings.email = email;
      settings.phone = phone;
      settings.workingHours = workingHours;
      settings.location = location;
      await settings.save();
    } else {
      settings = await ContactSettings.create({ email, phone, workingHours, location });
    }

    return NextResponse.json({ success: true, data: settings, message: "Contact details updated successfully" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await connectDB();
    await ContactSettings.deleteMany({});
    return NextResponse.json({ success: true, message: "Contact settings deleted successfully" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}