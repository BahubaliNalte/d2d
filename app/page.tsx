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
      <section className="relative flex items-center justify-center pt-[120px] pb-[70px] px-4 overflow-hidden" id="hero">
        {/* Dot grid background */}
        <div className="hero-grid absolute inset-0 opacity-40 pointer-events-none" />

        {/* Animated Background Glowing Blobs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-100/40 opacity-75 blur-[80px] pointer-events-none animate-pulse-soft" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-100/40 opacity-75 blur-[100px] pointer-events-none animate-pulse-soft" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-amber-100/30 opacity-60 blur-[80px] pointer-events-none animate-pulse-soft" style={{ animationDuration: '12s' }} />

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-8 z-10">
          {/* Left Column: Text and CTA */}
          <div className="lg:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start order-2 lg:order-1">
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-emerald-200/85 rounded-full px-4.5 py-2 mb-6 shadow-sm hover:border-emerald-300/85 transition-all cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-emerald-800 tracking-wide">Diploma to Degree · Direct 2nd Year (DSE)</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-slate-900 leading-[1.2] mb-5"
            >
              Get into Your <br className="hidden sm:inline" />
              <span className="premium-gradient-text">Dream Engineering</span> <br className="hidden lg:inline" />
              <span className="relative inline-block mt-1">
                College
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 120 8" fill="none" preserveAspectRatio="none">
                  <path d="M2 6 C30 2, 60 7, 90 4 C100 2, 110 6, 118 3" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed mb-6"
            >
              Expert DSE counselling for diploma students entering <strong className="text-slate-700 font-semibold">Direct Second Year</strong> engineering. Real-time alerts, college matching & end-to-end admission support.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 w-full sm:w-auto"
            >
              <Link href="/counselling" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 shadow-sm shadow-slate-900/5 hover:shadow-md hover:shadow-slate-900/15 bg-slate-900 text-white hover:-translate-y-0.5 active:scale-98">
                <FaGraduationCap className="text-base" />
                <span>Start Free Counselling</span>
                <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href="/counselling/premium" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-350 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-98">
                <FaStar className="text-amber-500 text-xs animate-pulse" />
                <span>View Premium Plans</span>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-xs text-slate-400 font-medium"
            >
              Free to start · No payment required · Maharashtra students only
            </motion.p>

            {/* Inline Stats Block */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 pt-6 border-t border-slate-200/60 w-full grid grid-cols-3 gap-2 sm:gap-4 text-center lg:text-left"
            >
              {[
                { value: "1000+", label: "Students Guided", sub: "Across Maharashtra" },
                { value: "98%", label: "Success Rate", sub: "DSE admissions" },
                { value: "24/7", label: "Support", sub: "Always available" },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 leading-none">{s.value}</span>
                  <span className="text-[10px] font-bold text-slate-800 mt-1 leading-tight">{s.label}</span>
                  <span className="text-[8px] text-slate-450 mt-0.5 leading-normal">{s.sub}</span>
                </div>
              ))}
            </motion.div>

          </div>

          {/* Right Column: Interactive Image Mockup & Floating Badges */}
          <div className="lg:col-span-7 flex justify-center items-center order-1 lg:order-2 w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative w-full max-w-md lg:max-w-none px-4 md:px-0"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/30 to-indigo-100/30 rounded-3xl blur-2xl -z-10 scale-95" />

              {/* Mockup Container */}
              <div className="mockup-container">
                {/* Mockup Header */}
                <div className="mockup-header">
                  <div className="mockup-dot bg-red-450" style={{ backgroundColor: '#ef4444' }} />
                  <div className="mockup-dot bg-yellow-450" style={{ backgroundColor: '#eab308' }} />
                  <div className="mockup-dot bg-green-455" style={{ backgroundColor: '#22c55e' }} />
                  <div className="h-4 bg-slate-100 rounded-full w-36 mx-auto opacity-60 flex items-center justify-center text-[8px] text-slate-400">
                    diploma2degree.in
                  </div>
                </div>

                {/* Image Wrapper */}
                <div className="mockup-image-wrapper relative group overflow-hidden shadow-2xl">
                  <img
                    src="/hero.png"
                    alt="D2D Platform Preview"
                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Floating Badges */}
              {/* Top Right: Seats Available Badge */}
              <motion.div
                className="animate-float-slow absolute -top-6 -right-4 hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl px-4 py-3 shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner">
                  <FaGraduationCap className="text-slate-900 text-base" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">DSE Seats Available</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Maharashtra 2025–26</p>
                </div>
              </motion.div>

              {/* Bottom Left: Students Placed Badge */}
              <motion.div
                className="animate-float-delayed absolute -bottom-6 -left-6 hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl px-4 py-3 shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
                  <FaCheckCircle className="text-emerald-500 text-base" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">1000+ Students Placed</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">98% success rate</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* ===== HOW IT WORKS ===== */}
      <section className="py-10 px-4 sm:px-6 bg-white" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8">
            <span className="inline-block px-3 py-0 text-xs font-bold uppercase tracking-widest text-slate-500 bg-slate-100 rounded-full mb-4">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Your path to DSE admission</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* connector line desktop */}
            <div className="hidden md:block absolute top-[22px] left-[calc(33%+24px)] right-[calc(33%+24px)] h-0.5 bg-gradient-to-r from-slate-200 via-emerald-200 to-slate-200 z-0" />

            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className={`relative z-10 flex md:flex-col items-start gap-4 rounded-2xl px-4 py-4 sm:px-5 sm:py-5 border transition-all duration-300 cursor-pointer group ${activeStep === i ? "border-emerald-300 bg-gradient-to-br from-emerald-50/80 to-white shadow-md shadow-emerald-100" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}
                onClick={() => setActiveStep(i)}
              >
                {/* Step Badge */}
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold transition-all ${activeStep === i ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"}`}>
                  {step.num}
                </div>
                {/* Content */}
                <div className="flex flex-col">
                  <h3 className={`text-sm sm:text-base font-bold mb-1 transition-colors ${activeStep === i ? "text-emerald-800" : "text-slate-900"}`}>{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
                {/* Active indicator bar */}
                {activeStep === i && (
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-emerald-400 rounded-r-full md:hidden" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT WE OFFER ===== */}
      <section className="py-10 px-4 sm:px-6 bg-slate-50" id="services">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
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
                className="card-hover bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200 transition-all duration-300 flex flex-col items-start"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 sm:mb-4">
                  {React.createElement(f.icon, { className: "text-lg sm:text-2xl text-slate-950" })}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHO IS THIS FOR ===== */}
      <section className="py-10 px-4 sm:px-6 bg-white" id="for-whom">
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
      <section className="py-8 px-4 sm:px-6 bg-slate-50" id="reviews">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-6">
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full mb-4">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Students who made it</h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto">From diploma uncertainty to confirmed B.E. admission — hear their stories.</p>
          </motion.div>
          <ClientReviewsLanding />
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-10 px-4 sm:px-6 bg-white relative overflow-hidden" id="cta">
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
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold bg-white text-black rounded-2xl hover:bg-slate-100 transition-all duration-300 hover:-translate-y-0.5 border border-slate-200 shadow-md">
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
                <img src="/Web Images/d2d-logo2.png" alt="Diploma2Degree" className="h-6 w-auto brightness-0 invert" />
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
              <div className="mt-6">
                <a
                  href="https://play.google.com/store/apps/details?id=com.d2d.diploma2degree&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-slate-900 hover:bg-black text-white rounded-xl px-4 py-2 border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
                >
                  <svg viewBox="0 0 365 365" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.3 3.3c-.8.8-1.3 2-1.3 3.7v346c0 1.7.5 2.9 1.3 3.7l1.7 1.7L209 170.5v-3L20 1.6l-1.7 1.7z" fill="#ea4335" />
                    <path d="M272.5 234.3l-63.5-63.8v-3l63.5-63.8 1.7.9 75 42.6c21.4 12.2 21.4 32 0 44.2l-75 42.6-1.7.3z" fill="#fbbc05" />
                    <path d="M20.8 356.7l188.2-188.7 63.8 63.8-198.3 112.7c-7.1 4-13.1.8-13.7-7.8z" fill="#34a853" />
                    <path d="M20.8 8.3C21.4 1.3 27.4-3 34.5 1L232.8 114l-63.8 63.8L20.8 8.3z" fill="#4285f4" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[9px] text-slate-400 uppercase font-semibold tracking-wider leading-none">Get it on</p>
                    <p className="text-sm font-bold leading-none mt-1">Google Play</p>
                  </div>
                </a>
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