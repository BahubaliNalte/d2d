"use client";

import React from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import Script from "next/script";
import { auth, database } from "@/lib/firebase";
import { ref as dbRef, set, onValue, get } from "firebase/database";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaCrown, FaCheck, FaLock, FaShieldAlt, FaMapMarkedAlt, FaGraduationCap, FaChartLine } from "react-icons/fa";

// ─── Data ──────────────────────────────────────────────────────────────────────
// Removed FAQs as requested

const fallbackStories = [
  { student: "Rohan Deshmukh", score: "96.40%", clg: "COEP, Pune", branch: "Computer", type: "CAP Rd 1", linkedin: "" },
  { student: "Sneha Patil", score: "95.80%", clg: "VJTI, Mumbai", branch: "IT", type: "CAP Rd 1", linkedin: "" },
  { student: "Pranav Kulkarni", score: "94.20%", clg: "PICT, Pune", branch: "E&TC", type: "CAP Rd 1", linkedin: "" },
  { student: "Tanvi Joshi", score: "95.10%", clg: "SPIT, Mumbai", branch: "Computer", type: "CAP Rd 2", linkedin: "" },
  { student: "Aditya Shinde", score: "93.90%", clg: "VIT, Pune", branch: "AI & DS", type: "CAP Rd 1", linkedin: "" },
  { student: "Yash Chavan", score: "92.80%", clg: "WCE, Sangli", branch: "Mechanical", type: "CAP Rd 2", linkedin: "" },
  { student: "Amol Naik", score: "94.50%", clg: "DJSCE, Mumbai", branch: "Computer", type: "CAP Rd 1", linkedin: "" },
  { student: "Sayali Patil", score: "93.15%", clg: "PCCOE, Pune", branch: "IT", type: "CAP Rd 1", linkedin: "" },
];

const bentoFeatures = [
  {
    title: "1:1 Expert Mentorship",
    desc: "A dedicated senior mentor assigned to guide your every decision — from option forms to lock-in strategy.",
    icon: FaGraduationCap,
    span: "lg:col-span-2",
  },
  {
    title: "AI College Prediction",
    desc: "Deterministic matching using real DSE intake data to find your perfect college.",
    icon: FaMapMarkedAlt,
    span: "lg:col-span-1",
  },
  {
    title: "Career Dashboard",
    desc: "Interactive portal to visualize your academic and career trajectory in real-time.",
    icon: FaChartLine,
    span: "lg:col-span-1",
  },
  {
    title: "All CAP Rounds Coverage",
    desc: "Complete support through all admission rounds — start to finish, no gaps.",
    icon: FaShieldAlt,
    span: "lg:col-span-2",
  },
];

const checklist = [
  "All CAP Rounds Guidance",
  "College Lock-in Strategy",
  "Doubt Clearing Sessions",
  "Priority Support Desk",
  "Admission Checklist",
];

export default function PremiumPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isPlusMember, setIsPlusMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phonePrompt, setPhonePrompt] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [premiumPrice, setPremiumPrice] = useState<number | null>(null);
  const [stories, setStories] = useState(fallbackStories);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cachedPhone, setCachedPhone] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const storiesRef = dbRef(database, "SuccessStories");
    const unsubscribe = onValue(storiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.values(data) as typeof fallbackStories;
        setStories(arr);
      } else {
        setStories(fallbackStories);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const authUnsub = auth.onAuthStateChanged((user) => {
      if (!user) { setIsPlusMember(false); setLoading(false); return; }
      const plusRef = dbRef(database, `PlusMembers`);
      unsubscribe = onValue(plusRef, (snapshot) => {
        let found = false;
        snapshot.forEach((child) => { if (child.val()?.uid === user.uid) found = true; });
        setIsPlusMember(found);
        setLoading(false);
      }, () => { setIsPlusMember(false); setLoading(false); });
    });
    return () => { authUnsub(); if (unsubscribe) unsubscribe(); };
  }, []);

  useEffect(() => {
    const priceRef = dbRef(database, "AppConfig/PlusMembershipPrice");
    const unsubscribe = onValue(priceRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = Number(snapshot.val());
        setPremiumPrice(!isNaN(val) ? val : null);
      } else setPremiumPrice(null);
    });
    return () => unsubscribe();
  }, []);

  const handleBuyNow = useCallback(async () => {
    // Debounce - prevent multiple clicks
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Please login to continue with the payment.");
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // Try to get phone - use cached value first
      let phone = user.phoneNumber || cachedPhone || "";
      
      if (!phone) {
        const snap = await get(dbRef(database, 'Users/' + user.uid + '/phone'));
        if (snap.exists()) {
          phone = snap.val();
          setCachedPhone(phone);
        }
      }

      if (user.providerData.some((p) => p.providerId === "google.com") && !phone) {
        setShowPhoneModal(true);
        setPhonePrompt("Please enter your phone number before purchasing premium membership.");
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
      }

      startRazorpay(phone);
    } catch (error) {
      console.error("Error in handleBuyNow:", error);
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [cachedPhone]);

  const handleSavePhoneAndPay = useCallback(async () => {
    if (isProcessingRef.current) return;
    
    const user = auth.currentUser;
    if (!user) return;
    if (!/^\d{10}$/.test(phoneInput)) {
      setPhonePrompt("Please enter a valid 10-digit phone number.");
      return;
    }

    isProcessingRef.current = true;
    try {
      await set(dbRef(database, 'Users/' + user.uid + '/phone'), phoneInput);
      setCachedPhone(phoneInput);
      setShowPhoneModal(false);
      startRazorpay(phoneInput);
    } catch (error) {
      console.error("Error saving phone:", error);
      toast.error("Failed to save phone number");
      isProcessingRef.current = false;
    }
  }, [phoneInput]);

  const startRazorpay = useCallback(async (phone: string) => {
    const user = auth.currentUser;
    if (!user) return;
    if (premiumPrice === null) {
      toast.error("Unable to fetch premium price. Please try again later.");
      isProcessingRef.current = false;
      setIsProcessing(false);
      return;
    }

    let orderId = null;
    try {
      const orderRes = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: premiumPrice * 100, currency: "INR" }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error("Order creation failed");
      orderId = orderData.order.id;
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Failed to create payment order. Please try again later.");
      isProcessingRef.current = false;
      setIsProcessing(false);
      return;
    }

    const handlePaymentResponse = async (response: any) => {
      try {
        const verifyRes = await fetch("/api/verify-razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          await set(dbRef(database, "PlusMembers/" + user.uid), {
            paymentId: response.razorpay_payment_id,
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            phone,
            purchasedAt: new Date().toISOString(),
            price: premiumPrice,
            timestamp: Date.now(),
          });
          toast.success("Payment successful! Redirecting...");
          setTimeout(() => router.push("/thank-you"), 1000);
        } else {
          toast.error("Payment verification failed. Please contact support.");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        toast.error("Payment verification failed. Please contact support.");
      } finally {
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    };

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || "",
      amount: premiumPrice * 100,
      currency: "INR",
      name: "Diploma2Degree Premium",
      description: "Premium Counselling Package",
      image: "/Web Images/d2d-logo1.png",
      order_id: orderId,
      handler: handlePaymentResponse,
      prefill: { name: user.displayName || "", email: user.email || "", contact: phone },
      theme: { color: "#111827" },
      modal: {
        ondismiss: () => {
          isProcessingRef.current = false;
          setIsProcessing(false);
        },
      },
    };

    // @ts-ignore
    new window.Razorpay(options).open();
  }, [premiumPrice, router]);

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Modal for phone input */}
      <AnimatePresence>
        {showPhoneModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 10 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-slate-200"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Enter Your Phone</h3>
              <p className="text-slate-600 text-sm mb-6">{phonePrompt}</p>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit phone number"
                maxLength={10}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-4 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPhoneModal(false)}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition ${
                    isProcessing
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePhoneAndPay}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                    isProcessing
                      ? "bg-slate-400 text-slate-200 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-black text-white"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-slate-200 border-t-white animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-6 md:px-12 bg-slate-50 border-b border-slate-200 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl" />
        </div>

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 mb-6 shadow-sm"
          >
            <FaCrown className="text-slate-900" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">Premium Membership</span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
            Unlock Your<br />
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Perfect DSE Seat
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-lg mx-auto mb-10 leading-relaxed font-medium">
            Expert 1:1 mentorship, AI-powered college matching, and full CAP round support. Join 500+ successful students already admitted to their dream colleges.
          </p>

          <motion.button
            whileHover={{ scale: isProcessing ? 1 : 1.05 }}
            whileTap={{ scale: isProcessing ? 1 : 0.95 }}
            onClick={handleBuyNow}
            disabled={isProcessing}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-slate-900/30 ${
              isProcessing
                ? "bg-slate-400 text-slate-200 cursor-not-allowed"
                : "bg-slate-900 hover:bg-black text-white"
            }`}
          >
            {isProcessing ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-white animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaCrown />
                Join Premium
              </>
            )}
          </motion.button>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
            SUCCESS STORIES TICKER
        ══════════════════════════════════════════════════════════════ */}
        <div className="bg-slate-50 py-10 border-b border-slate-200 overflow-hidden relative">
          <div className="max-w-5xl mx-auto px-6 mb-6">
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 text-center">
              Last Year's DSE Placements
            </h3>
          </div>

          <div className="flex relative">
            {/* Left/Right Fade Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

            <motion.div
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              className="flex gap-4 w-max"
            >
              {[...stories, ...stories].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 min-w-[280px] shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-sm">
                    {s.student.charAt(0)}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      {s.student}
                      {s.linkedin && (
                        <a href={s.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors ml-2" title="View LinkedIn">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{s.clg}</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">{s.branch} • {s.score}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            BENTO FEATURE GRID
        ══════════════════════════════════════════════════════════════ */}
        <section id="features" className="py-24 px-6 md:px-12 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Built For Your Success</h2>
              <p className="text-slate-500 text-base max-w-lg mx-auto">
                Clean, deterministic, and highly accurate tools to ensure you lock the best possible seat in Maharashtra.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bentoFeatures.map((item, i) => (
                <div
                  key={i}
                  className={`${item.span} group bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:border-slate-300 transition-colors duration-300`}
                >
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                      {React.createElement(item.icon, { className: "text-3xl text-slate-900" })}
                  </div>
                  <h3 className="font-bold text-slate-900 text-xl mb-3">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            PRICING / MEMBER DASHBOARD
        ══════════════════════════════════════════════════════════════ */}
        <section id="pricing" className="py-24 px-6 md:px-12 bg-slate-50 border-t border-slate-200">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                {isPlusMember ? "Member Dashboard" : "Simple, Transparent Pricing"}
              </h2>
              <p className="text-slate-500 text-base max-w-lg mx-auto">
                {isPlusMember ? "Access your premium DSE tools below." : "One flat fee. Complete coverage for the entire admission cycle."}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-slate-900 animate-spin" />
              </div>
            ) : isPlusMember ? (
              /* ── Member Dashboard ── */
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">

                {/* Left side: What's included */}
                <div className="lg:w-3/5 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-slate-200">
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">D2D Premium Pass</h3>
                  <p className="text-slate-500 mb-8 font-medium">Everything you need to secure your seat.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    {checklist.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaCheck className="text-[10px] text-slate-900" />
                        </div>
                        <span className="text-slate-700 font-semibold text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Member Status Card */}
                <div className="lg:w-2/5 p-8 md:p-12 bg-gradient-to-br from-emerald-50 to-slate-50 flex flex-col justify-center border-l border-emerald-100">
                  <div className="inline-flex items-center gap-2 mb-6 bg-white px-4 py-2 rounded-full w-fit">
                    <FaCheck className="text-emerald-600 text-lg" />
                    <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Active Member</span>
                  </div>
                  
                  <h4 className="text-2xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                    You're All Set! <FaCrown className="text-amber-500 animate-pulse text-xl" />
                  </h4>
                  <p className="text-slate-600 text-sm mb-8 leading-relaxed">
                    Your premium membership is active. Access all exclusive features and get personalized guidance for your DSE journey.
                  </p>

                  <div className="space-y-3 mb-8">
                    <button
                      onClick={() => router.push('/counselling/mentorship')}
                      className="w-full px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold transition-all shadow-lg"
                    >
                      Book Mentorship Session
                    </button>
                    <button
                      onClick={() => router.push('/counselling/best-college-list')}
                      className="w-full px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold border-2 border-slate-200 transition-all"
                    >
                      Get AI College List
                    </button>
                    <button
                      onClick={() => router.push('/counselling/direct-chat')}
                      className="w-full px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-semibold border-2 border-slate-200 transition-all"
                    >
                      Direct Chat with Counsellors
                    </button>
                  </div>

                  <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Premium benefits last for entire admission cycle
                  </p>
                </div>
              </div>
            ) : (
              /* ── Non-Member Pricing ── */
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
                {/* Left side: What's included */}
                <div className="lg:w-3/5 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-slate-200">
                  <h3 className="text-2xl font-extrabold text-slate-900 mb-2">D2D Premium Pass</h3>
                  <p className="text-slate-500 mb-8 font-medium">Everything you need to secure your seat.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    {checklist.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaCheck className="text-[10px] text-slate-900" />
                        </div>
                        <span className="text-slate-700 font-semibold text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Checkout Card */}
                <div className="lg:w-2/5 p-8 md:p-12 bg-slate-50 flex flex-col justify-center">
                  <div className="mb-2">
                    <span className="text-slate-500 line-through font-semibold">₹1499</span>
                    {premiumPrice !== null && (
                      <span className="ml-3 inline-block px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                        Save {Math.round((1 - premiumPrice / 1499) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-black text-slate-900 tracking-tight">
                      ₹{premiumPrice !== null ? premiumPrice : "—"}
                    </span>
                    <span className="text-slate-500 font-semibold">/ full plan</span>
                  </div>

                  <button
                    onClick={handleBuyNow}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg mb-4 flex items-center justify-center gap-2 ${
                      isProcessing
                        ? "bg-slate-400 text-slate-200 cursor-not-allowed shadow-slate-400/20"
                        : "bg-slate-900 hover:bg-black text-white shadow-slate-900/20"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-white animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaLock />
                        Unlock Premium
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Limited to 50 students per batch
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CONTACT SECTION
        ══════════════════════════════════════════════════════════════ */}
        <section className="py-24 px-6 md:px-12 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Need Help?</h2>
            <p className="text-slate-500 text-base max-w-lg mx-auto mb-10">
              Reach out to our counselling experts directly on WhatsApp or call us.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="tel:+918767884789" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold transition-colors text-sm shadow-sm flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
                +91 87678 84789
              </a>
              <a href="tel:+917499189032" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 font-bold transition-colors text-sm shadow-sm flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
                +91 74991 89032
              </a>
            </div>
          </div>
        </section>

      </main>
  );
}