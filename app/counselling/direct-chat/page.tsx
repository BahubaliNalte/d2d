"use client";

import React from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { FaCrown, FaLock } from "react-icons/fa";

export default function DirectChatPage() {
  const { loading: authLoading, authResolved, user: authUser, isPremium } =
    useRequireAuth({ requirePremium: true });

  // ── Show spinner while auth is resolving ─────────────────────────────────
  if (authLoading || !authResolved) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-slate-900 animate-spin" />
      </main>
    );
  }

  // ── Premium gate: user is logged in but NOT premium ──────────────────────
  if (authResolved && authUser && !isPremium) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-3xl p-10 shadow-lg w-full max-w-lg border border-slate-200 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6 border border-slate-200">
            <FaLock className="text-2xl text-slate-900" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
            Premium Feature
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Direct Chat with Counsellors is exclusively available for Premium
            members. Upgrade to get instant access to our expert team on
            WhatsApp.
          </p>
          <Link
            href="/counselling/premium"
            className="inline-flex items-center gap-2 w-full justify-center py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-lg shadow-md transition duration-300"
          >
            <FaCrown className="text-amber-400" />
            Upgrade to Premium
          </Link>
          <Link
            href="/counselling"
            className="block mt-4 text-sm text-slate-500 hover:text-slate-700 font-medium transition"
          >
            ← Back to Counselling
          </Link>
        </div>
      </main>
    );
  }

  // ── Not logged in — redirect already fired, show nothing ─────────────────
  if (!authUser) return null;

  // ── Full page for premium users ───────────────────────────────────────────
  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4 font-poppins">
      <div className="bg-white rounded-3xl p-10 shadow-lg w-full max-w-lg border border-slate-200 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 text-center">
          Direct Chat with Counsellor
        </h1>
        <p className="text-slate-600 mb-6 text-center leading-relaxed">
          Chat instantly with our expert counsellors for any queries or support.
          Click the button below to start a WhatsApp chat.
        </p>
        <a
          href="https://wa.me/918767884789?text=I%20am%20a%20premium%20member%20and%20need%20counselling%20support"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg text-center shadow-md hover:shadow-lg transition-all duration-300"
        >
          Start WhatsApp Chat
        </a>
      </div>
    </main>
  );
}
