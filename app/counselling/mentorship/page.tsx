"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { database } from "@/lib/firebase";
import { ref, push, onValue } from "firebase/database";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { FaCrown, FaLock } from "react-icons/fa";

export default function MentorshipPage() {
  const { loading: authLoading, authResolved, user: authUser, isPremium } =
    useRequireAuth({ requirePremium: true });

  const [requestStatus, setRequestStatus] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>("");
  const [sessionTime, setSessionTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (authLoading || !authUser || !isPremium) return;
    const reqRef = ref(database, "mentorshipRequests");
    const unsubscribe = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).filter(
          (r: any) => r.email === authUser.email
        );
        if (arr.length > 0) {
          const req = arr[0] as any;
          setRequestStatus(req.status || "pending");
          setSessionDate(req.date || "");
          setSessionTime(req.time || "");
        } else {
          setRequestStatus("");
          setSessionDate("");
          setSessionTime("");
        }
      } else {
        setRequestStatus("");
        setSessionDate("");
        setSessionTime("");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [authLoading, authUser, isPremium]);

  const handleRequest = async () => {
    if (!authUser) return;
    setRequesting(true);
    await push(ref(database, "mentorshipRequests"), {
      name: authUser.displayName || "",
      email: authUser.email || "",
      phone: authUser.phoneNumber || "",
      status: "pending",
    });
    setRequesting(false);
  };

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
            1:1 Mentorship is exclusively available for Premium members. Upgrade
            to get a dedicated senior mentor for your entire DSE journey.
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
      <div className="bg-white rounded-3xl p-10 shadow-lg w-full max-w-lg border border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 text-center">
          1:1 Mentorship
        </h1>
        <p className="text-slate-600 mb-6 text-center leading-relaxed">
          Book a personalized 1:1 mentorship session with our expert counsellors.
          Get guidance on college selection, career planning, and more.
        </p>
        {loading ? (
          <div className="text-center text-slate-500">Loading...</div>
        ) : requestStatus ? (
          <div className="mb-4 text-center">
            <div className="font-semibold text-lg text-slate-900">
              Request Status:{" "}
              <span className="capitalize">{requestStatus}</span>
            </div>
            {requestStatus === "accepted" && sessionDate && sessionTime && (
              <div className="mt-2 text-emerald-600 font-medium">
                Session Scheduled: {sessionDate} at {sessionTime}
              </div>
            )}
          </div>
        ) : (
          <button
            className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-md hover:bg-black transition duration-300"
            onClick={handleRequest}
            disabled={requesting}
          >
            {requesting ? "Requesting..." : "Request 1:1 Mentorship"}
          </button>
        )}
      </div>
    </main>
  );
}
