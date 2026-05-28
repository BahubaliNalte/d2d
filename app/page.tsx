"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaLinkedin, FaBars, FaBell, FaWhatsapp, FaTimes, FaArrowRight, FaGraduationCap, FaCheckCircle, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBullseye, FaClipboardList, FaHandshake, FaStar, FaHeart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, onValue } from "firebase/database";
import { app, database } from "../lib/firebase";
import ClientReviewsLanding from "./ClientReviewsLanding";
import PremiumUserNotifications from "@/components/PremiumUserNotifications";


export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showNotifDot, setShowNotifDot] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getDatabase(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = ref(db, `Users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) setUserData(snapshot.val());
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const lastSeen = localStorage.getItem("d2d_last_seen_notif");
    const annRef = ref(database, "n&a");
    const unsub = onValue(annRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).map((a: any) => a.createdAt || "").sort();
        const latest = arr[arr.length - 1];
        setShowNotifDot(!!(latest && latest !== lastSeen));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveStep(s => (s + 1) % 3), 3000);
    return () => clearInterval(timer);
  }, []);

  const handleNotifClick = () => {
    onValue(ref(database, "n&a"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).map((a: any) => a.createdAt || "").sort();
        const latest = arr[arr.length - 1];
        if (latest) { localStorage.setItem("d2d_last_seen_notif", latest); setShowNotifDot(false); }
      }
    }, { onlyOnce: true });
  };

  const steps = [
    { num: "01", title: "Share Your Details", desc: "Tell us your diploma branch, percentile & preferred colleges." },
    { num: "02", title: "Get Your College List", desc: "We match you to the best DSE seats based on your profile." },
    { num: "03", title: "Secure Your Seat", desc: "We guide you through choice filling, documents & enrollment." },
  ];

  const features = [
    { icon: FaBullseye, title: "Cutoff Predictions", desc: "Know your chances before choice filling with real data-backed insights." },
    { icon: FaBell, title: "Live Merit Alerts", desc: "Instant notifications for merit list releases, document rounds & deadlines." },
    { icon: FaClipboardList, title: "Document Help", desc: "Eligibility checks, certificate verification & application support." },
    { icon: FaHandshake, title: "1:1 Mentorship", desc: "Talk to seniors who took the DSE route and know the journey firsthand." },
  ];

  return (
    <div className="min-h-screen text-slate-800 overflow-x-hidden" style={{ fontFamily: "'Sora', 'Plus Jakarta Sans', sans-serif", background: "#faf9f7" }}>
      {/* Styles removed for parsing */}



      {/* ===== NAVBAR ===== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/Web Images/d2d-logo1.png" alt="D2D" className="h-8 w-auto" />
            <div>
              <img src="/Web Images/d2d-logo2.png" alt="Diploma2Degree" className="h-6 w-auto" />
              <p className={`text-[9px] font-medium leading-none mt-0.5 transition-all duration-300 ${scrolled ? "text-slate-400" : "text-slate-700"}`}>तुमचे Percentage + आमचे Guidance</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/counselling" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all">Counselling</Link>
            <Link href="/counselling/premium" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all">Premium</Link>
            <Link href="/profile" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all">Profile</Link>
            <Link href="/counselling/notifications" onClick={handleNotifClick}
              className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all">
              <FaBell className="text-base" />
              {showNotifDot && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />}
            </Link>
            {!userData && (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all">Login</Link>
                <Link href="/signup" className="ml-2 px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all shadow-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link href="/counselling/notifications" onClick={handleNotifClick} className="relative p-2 text-slate-500">
              <FaBell className="text-base" />
              {showNotifDot && <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />}
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition">
              {menuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 overflow-hidden">
              <div className="px-4 py-3 space-y-1">
                <Link href="/counselling" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition">Counselling</Link>
                <Link href="/counselling/premium" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition">Premium</Link>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition">Profile</Link>
                {!userData && (
                  <>
                    <div className="h-px bg-slate-100 my-1" />
                    <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50 transition">Login</Link>
                    <Link href="/signup" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-sm font-semibold text-white bg-slate-900 rounded-xl text-center hover:bg-slate-800 transition">Get Started</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 pb-12 px-4" id="hero">
        {/* Dot grid background */}
        <div className="hero-grid absolute inset-0 opacity-40 pointer-events-none" />

        {/* Floating decoration blobs */}
        <div className="absolute top-24 right-10 md:right-24 w-48 h-48 rounded-full bg-emerald-50 opacity-70 blur-3xl pointer-events-none" />
        <div className="absolute bottom-24 left-10 md:left-24 w-64 h-64 rounded-full bg-blue-50 opacity-60 blur-3xl pointer-events-none" />

        {/* Floating badge top-right */}
        <motion.div
          className="float absolute top-32 right-6 md:right-24 hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
        >
          <FaGraduationCap className="text-slate-900 text-lg" />
          <div>
            <p className="text-xs font-semibold text-slate-800">DSE Seats Available</p>
            <p className="text-[10px] text-slate-400">Maharashtra 2025–26</p>
          </div>
        </motion.div>

        {/* Floating badge bottom-left */}
        <motion.div
          className="float absolute bottom-36 left-6 md:left-24 hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.3 }}
          style={{ animationDelay: "1.5s" }}
        >
          <FaCheckCircle className="text-emerald-500 text-lg" />
          <div>
            <p className="text-xs font-semibold text-slate-800">1000+ Students Placed</p>
            <p className="text-[10px] text-slate-400">98% success rate</p>
          </div>
        </motion.div>

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Tag */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 tag-pill border border-emerald-200 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-emerald-800">Diploma to Degree · Direct 2nd Year (DSE)</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-4"
          >
            Get into Your Dream<br />
            <span className="relative inline-block mt-1">
              Engineering College
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none">
                <path d="M2 6 C50 2, 100 7, 150 4 C200 1, 250 6, 298 3" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-10"
          >
            Expert DSE counselling for diploma students entering <strong className="text-slate-700">Direct Second Year</strong> engineering — college matching, real-time alerts & full admission support.
          </motion.p>

          {/* ===== TWO MAIN BUTTONS ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              href="/counselling"
              className="btn-primary inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-slate-900/20"
            >
              <FaGraduationCap className="text-lg" />
              Start Free Counselling
              <FaArrowRight className="text-sm" />
            </Link>
            <Link
              href="/counselling/premium"
              className="btn-outline inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold rounded-2xl transition-all duration-300"
            >
              <FaStar className="text-amber-500 text-sm" />
              View Premium Plans
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
            className="mt-6 text-xs text-slate-400 font-medium"
          >
            Free to start · No payment required · Maharashtra students only
          </motion.p>
        </div>
      </section>

      {/* ===== STATS BAND ===== */}
      <section className="stat-bg py-12 px-4" id="stats">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 md:gap-8 text-center">
          {[
            { value: "1000+", label: "Students Guided", sub: "Across Maharashtra" },
            { value: "98%", label: "Success Rate", sub: "DSE admissions" },
            { value: "24 / 7", label: "Support", sub: "Always available" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">{s.value}</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">{s.label}</div>
              <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 px-4 sm:px-6 bg-white" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 rounded-full mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Your path to DSE admission</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* connector line desktop */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-slate-200 z-0" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className={`relative z-10 card-hover rounded-2xl p-7 border transition-all duration-300 cursor-pointer ${activeStep === i ? "border-slate-900 shadow-lg" : "border-slate-200 bg-white"}`}
                onClick={() => setActiveStep(i)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-5 transition-all ${activeStep === i ? "step-active" : "step-inactive"}`}>
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT WE OFFER ===== */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50" id="services">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-500 bg-white border border-slate-200 rounded-full mb-4">What We Offer</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Everything for your DSE journey</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">From cutoff predictions to document help — we cover every step of Direct Second Year admission.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card-hover bg-white rounded-2xl p-6 border border-slate-200 transition-all duration-300 flex flex-col items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  {React.createElement(f.icon, { className: "text-2xl text-slate-950" })}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHO IS THIS FOR ===== */}
      <section className="py-20 px-4 sm:px-6 bg-white" id="for-whom">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 rounded-full mb-4">Is This For You?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Made for diploma students like you</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "Completed diploma from a polytechnic in Maharashtra",
              "Want to join B.E. / B.Tech in Direct Second Year (DSE)",
              "Confused about college choices, cutoffs & the CAP process",
              "Need help with document verification & eligibility",
              "Want to make the best possible college choice with your score",
            ].map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <FaCheckCircle className="text-emerald-500 text-base mt-0.5 shrink-0" />
                <span className="text-sm text-slate-700 font-medium leading-snug">{point}</span>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
            <Link
              href="/counselling"
              className="inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-slate-900 rounded-2xl hover:bg-black shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-0.5">
              Yes, I Need Counselling <FaArrowRight className="text-sm" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50" id="reviews">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full mb-4">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Students who made it</h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto">From diploma uncertainty to confirmed B.E. admission — hear their stories.</p>
          </motion.div>
          <ClientReviewsLanding />
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-20 px-4 sm:px-6 bg-white relative overflow-hidden" id="cta">
        <div className="absolute inset-0 hero-grid opacity-10 pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-black">Admissions 2025–26 Open</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black mb-4 leading-tight">
            Don't leave your DSE seat<br />to chance
          </h2>
          <p className="text-black mb-10 text-base leading-relaxed">
            Get expert guidance and secure your Direct Second Year B.E. seat at the best engineering college for your profile.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-slate-900 bg-white rounded-2xl hover:bg-slate-100 shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              Get Started Free <FaArrowRight className="text-sm" />
            </Link>
            <Link href="/counselling/premium"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold bg-amber-500 text-black rounded-2xl hover:bg-amber-600 transition-all duration-300 hover:-translate-y-0.5">
              <FaStar className="text-black text-sm shrink-0" /> Premium Plans
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 text-white pt-14 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/Web Images/d2d-logo1.png" alt="D2D" className="h-8 w-auto" />
                <img src="/Web Images/d2d-logo2.png" alt="Diploma2Degree" className="h-6 w-auto brightness-200 invert" />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                Expert DSE counselling for diploma students entering Direct Second Year engineering in Maharashtra.
              </p>
              <div className="flex gap-2.5">
                {[
                  { href: "https://chat.whatsapp.com/LTcuLVPipunFPjodf2ifkl?mode=gi_t", icon: <FaWhatsapp />, hover: "hover:bg-green-600" },
                  { href: "https://www.instagram.com/diploma_2_degree?utm_source=qr&igsh=MTVnYmw1Nzh2cWV2OA==", icon: <FaInstagram />, hover: "hover:bg-pink-600" },
                  { href: "https://www.facebook.com/share/163fQuaUqb/", icon: <FaFacebook />, hover: "hover:bg-blue-600" },
                  { href: "https://www.linkedin.com/company/diploma2degree/?", icon: <FaLinkedin />, hover: "hover:bg-blue-700" },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    className={`w-9 h-9 rounded-xl bg-slate-800 ${s.hover} flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200`}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-5">Quick Links</h4>
              <div className="space-y-3">
                {[["Counselling", "/counselling"], ["Premium Plans", "/counselling/premium"], ["Scholarships", "/counselling/scholarships"], ["Notifications", "/counselling/notifications"]].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className={`block text-sm transition ${label === "Premium Plans" ? "text-white font-semibold" : "text-slate-400 hover:text-white"}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-5">Resources</h4>
              <div className="space-y-3">
                {[["Maharashtra Colleges", "/counselling/maharashtra-colleges"], ["College Predictor", "/counselling/predictor"]].map(([label, href]) => (
                  <Link key={href} href={href} className="block text-sm text-slate-400 hover:text-white transition">{label}</Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-5">Contact</h4>
              <div className="space-y-3 text-sm text-slate-400">
                <p className="flex items-start gap-2"><FaMapMarkerAlt className="mt-1 shrink-0" /><span>Pune, Maharashtra, India</span></p>
                <p className="flex items-start gap-2"><FaPhone className="mt-1 shrink-0" /><span>+91 86259 54301<br />+91 74991 89032</span></p>
                <a href="mailto:diplomatwodegree@gmail.com" className="flex items-start gap-2 hover:text-white transition">
                  <FaEnvelope className="mt-1 shrink-0" /><span>diplomatwodegree@gmail.com</span>
                </a>
                <a href="mailto:support.diploma2degree@gmail.com" className="flex items-start gap-2 hover:text-white transition">
                  <FaEnvelope className="mt-1 shrink-0" /><span>support.diploma2degree@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            
            <p className="text-xs text-slate-600">Made with <FaHeart className="text-red-500 inline mx-0.5" /> for diploma students in Maharashtra</p>
          </div>
        </div>
      </footer>

      {/* Premium User Notifications */}
      <PremiumUserNotifications />
    </div>
  );
}