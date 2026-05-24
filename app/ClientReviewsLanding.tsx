"use client";

import { useEffect, useRef, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientReviewsLanding() {
  const [reviews, setReviews] = useState<{ name: string; review: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  const getVisibleCount = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 768 ? 3 : 1;
    }
    return 1;
  };
  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  useEffect(() => {
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const reviewRef = ref(database, "clientReviews");
    const unsubscribe = onValue(reviewRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).map((r: any) => ({
          name: r.name || "",
          review: r.review || "",
        }));
        setReviews(arr);
      } else {
        setReviews([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (reviews.length <= visibleCount) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [reviews, visibleCount]);

  const getVisibleReviews = () => {
    if (reviews.length <= visibleCount) return reviews;
    let start = current;
    let end = start + visibleCount;
    if (end > reviews.length) {
      return [...reviews.slice(start), ...reviews.slice(0, end - reviews.length)];
    }
    return reviews.slice(start, end);
  };

  if (loading) {
    return (
      <div className="flex gap-6 justify-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-full max-w-xs p-6 rounded-2xl bg-white border border-slate-100">
            <div className="skeleton h-4 w-3/4 mb-3 rounded" />
            <div className="skeleton h-4 w-full mb-2 rounded" />
            <div className="skeleton h-4 w-2/3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8">
        <p className="text-lg">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-5 justify-center transition-all duration-500">
        {getVisibleReviews().map((r, i) => (
          <motion.div
            key={`${current}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 min-w-[260px] max-w-xs w-full"
          >
            {/* Quote icon */}
            <div className="text-blue-100 text-3xl font-serif mb-2 leading-none">"</div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{r.review}</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{r.name?.[0]?.toUpperCase() || "?"}</span>
              </div>
              <span className="text-sm font-semibold text-slate-700">{r.name}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dots */}
      {reviews.length > visibleCount && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: reviews.length }).map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === current
                  ? "bg-blue-600 w-6"
                  : "bg-slate-200 hover:bg-slate-300"
              }`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to review ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
