
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import admin from "../../../lib/firebaseAdmin";

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
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, error: "Unauthorized: invalid token" },
        { status: 401 }
      );
    }
    const userUid = decodedToken.uid;

    // ── 2. Fetch real price from Firebase (never trust client) ────────────────
    const priceSnap = await admin
      .database()
      .ref("AppConfig/PlusMembershipPrice")
      .once("value");
    const price = Number(priceSnap.val());
    if (!priceSnap.exists() || isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: "Premium price not configured" },
        { status: 500 }
      );
    }
    const amountInPaise = Math.round(price * 100); // INR → paise

    // ── 3. Check Razorpay credentials ─────────────────────────────────────────
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_SECRET;
    if (!key_id || !key_secret) {
      console.error("Razorpay credentials missing");
      return NextResponse.json(
        { success: false, error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // ── 4. Create the order with the SERVER-SIDE price ─────────────────────────
    const Razorpay = (await import("razorpay")).default;
    const instance = new Razorpay({ key_id, key_secret });
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${userUid.slice(0, 8)}_${Date.now()}`,
    };
    const order = await instance.orders.create(options);

    // Save order_id <-> userUid mapping for webhook verification
    if (order && order.id) {
      await admin.database().ref("Orders/" + order.id).set({
        uid: userUid,
        amount: price,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, order, amount: price });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json(
      { success: false, error: "Order creation failed" },
      { status: 500 }
    );
  }
}
