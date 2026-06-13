import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import admin from "../../../lib/firebaseAdmin";

export const runtime = "nodejs";


export async function POST(req: NextRequest) {
  try {
    // ── 1. Authenticate the request ──────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: missing token" },
        { status: 401 }
      );
    }
    const idToken = authHeader.split("Bearer ")[1];
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: "Unauthorized: invalid token" },
        { status: 401 }
      );
    }

    // ── 2. Verify Razorpay signature ──────────────────────────────────────────
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
    const secret = process.env.RAZORPAY_SECRET;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !secret) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
