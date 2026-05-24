"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { auth, database } from "@/lib/firebase";
import { ref as dbRef, set, onValue, get } from "firebase/database";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaCrown, FaCheck, FaLock, FaShieldAlt, FaMapMarkedAlt, FaGraduationCap, FaComments, FaChartLine } from "react-icons/fa";

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

const memberFeatures = [
  {
    title: "1:1 Mentorship",
    desc: "Personal guidance from seasoned experts for every step of your journey.",
    href: "/counselling/mentorship",
    cta: "Book Session",
    icon: <FaGraduationCap className="text-xl" />,
  },
  {
    title: "AI-Based College List",
    desc: "Smart, data-driven college suggestions tailored to your exact profile.",
    href: "/counselling/best-college-list",
    cta: "Request List",
    icon: <FaMapMarkedAlt className="text-xl" />,
  },
  {
    title: "Direct Chat",
    desc: "Instant access to counsellors — get answers when you need them most.",
    href: "/counselling/direct-chat",
    cta: "Start Chat",
    icon: <FaComments className="text-xl" />,
  },
];

const bentoFeatures = [
  {
    title: "1:1 Expert Mentorship",
    desc: "A dedicated senior mentor assigned to guide your every decision — from option forms to lock-in strategy.",
    icon: <FaGraduationCap className="text-3xl text-slate-900" />,
    span: "lg:col-span-2",
  },
  {
    title: "AI College Prediction",
    desc: "Deterministic matching using real DSE intake data to find your perfect college.",
    icon: <FaMapMarkedAlt className="text-3xl text-slate-900" />,
    span: "lg:col-span-1",
  },
  {
    title: "Career Dashboard",
    desc: "Interactive portal to visualize your academic and career trajectory in real-time.",
    icon: <FaChartLine className="text-3xl text-slate-900" />,
    span: "lg:col-span-1",
  },
  {
    title: "All CAP Rounds Coverage",
    desc: "Complete support through all admission rounds — start to finish, no gaps.",
    icon: <FaShieldAlt className="text-3xl text-slate-900" />,
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

  const handleBuyNow = async () => {
    const user = auth.currentUser;
    if (!user) { alert("Please login to continue with the payment."); return; }
    let phone = user.phoneNumber || "";
    if (!phone) {
      const snap = await get(dbRef(database, 'Users/' + user.uid + '/phone'));
      if (snap.exists()) phone = snap.val();
    }
    if (user.providerData.some((p) => p.providerId === "google.com") && !phone) {
      setShowPhoneModal(true);
      setPhonePrompt("Please enter your phone number before purchasing premium membership.");
      return;
    }
    startRazorpay(phone);
  };

  const handleSavePhoneAndPay = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!/^\d{10}$/.test(phoneInput)) { setPhonePrompt("Please enter a valid 10-digit phone number."); return; }
    await set(dbRef(database, 'Users/' + user.uid + '/phone'), phoneInput);
    setShowPhoneModal(false);
    startRazorpay(phoneInput);
  };

  const startRazorpay = async (phone: string) => {
    const user = auth.currentUser;
    if (!user) return;
    if (premiumPrice === null) { toast.error("Unable to fetch premium price. Please try again later."); return; }
    let orderId = null;
    try {
      const orderRes = await fetch("/api/create-razorpay-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: premiumPrice * 100, currency: "INR" }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error("Order creation failed");
      orderId = orderData.order.id;
    } catch { toast.error("Failed to create payment order. Please try again later."); return; }
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY as string,
      amount: premiumPrice * 100, currency: "INR",
      name: "Diploma2Degree Premium", description: "Premium Counselling Package",
      image: "/Web Images/d2d-logo1.png", order_id: orderId,
      handler: async function (response: any) {
        const verifyRes = await fetch("/api/verify-razorpay", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature }),
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          set(dbRef(database, "PlusMembers/" + user.uid), {
            paymentId: response.razorpay_payment_id, uid: user.uid, name: user.displayName,
            email: user.email, phone, purchasedAt: new Date().toISOString(), price: premiumPrice, timestamp: Date.now(),
          }).then(() => { toast.success("Payment successful! Redirecting..."); setTimeout(() => router.push("/thank-you"), 2000); })
            .catch(() => toast.error("Payment saved, but something went wrong."));
        } else toast.error("Payment verification failed. Please contact support.");
      },
      prefill: { name: user.displayName || "", email: user.email || "", contact: phone },
      theme: { color: "#111827" },
    };

    // @ts-ignore
    new window.Razorpay(options).open();
  };

  return (
            </motion.div>
          </div>
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
                        <a href={s.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors" title="View LinkedIn">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="mt-4 w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold"
                      onClick={() => router.back()}
                    >
                      ← Back
                    </motion.button>
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
                    {item.icon}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {memberFeatures.map((f, i) => (
                  <a
                    href={f.href}
                    key={i}
                    className="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-slate-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-8">{f.desc}</p>
                    <div className="inline-flex items-center gap-2 font-bold text-sm text-slate-900 group-hover:underline underline-offset-4">
                      {f.cta} &rarr;
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              /* ── Pricing Split View ── */
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
                        Save {Math.round((1 - premiumPrice / 999) * 100)}%
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
                    className="w-full py-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-lg shadow-slate-900/20 mb-4 flex items-center justify-center gap-2"
                  >
                    <FaLock />
                    Secure Your Spot
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