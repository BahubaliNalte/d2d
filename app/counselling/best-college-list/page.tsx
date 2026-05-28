"use client";

import React, { useState } from "react";
import Link from "next/link";
import { database, auth } from "@/lib/firebase";
import { ref, push, get, set } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref as dbRef, onValue } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";

export default function BestCollegeListPage() {
  const [form, setForm] = useState({
    caste: "",
    percentage: "",
    cities: ["", "", ""],
    branches: ["", "", ""],
    details: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formError, setFormError] = useState("");
  const [isPlusMember, setIsPlusMember] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  // Check premium status and usage count
  React.useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const authUnsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        setIsLoggedIn(false);
        setIsPlusMember(false);
        setUsageCount(0);
        return;
      }
      setIsLoggedIn(true);

      // Check PlusMember status
      const plusRef = ref(database, `PlusMembers`);
      unsubscribe = onValue(plusRef, (snapshot) => {
        let found = false;
        snapshot.forEach((child) => {
          if (child.val()?.uid === user.uid) found = true;
        });
        setIsPlusMember(found);
      });

      // Fetch list generator usage
      get(ref(database, `Users/${user.uid}/listGeneratorUsage`)).then((snap) => {
        if (snap.exists()) {
          setUsageCount(snap.val());
        } else {
          setUsageCount(0);
        }
      });
    });
    return () => {
      authUnsub();
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Get current user
  React.useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's requests
  React.useEffect(() => {
    if (!user) return;
    const reqRef = dbRef(database, "requestclglist");
    const unsubscribe = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data)
          .map(([id, req]: [string, any]) => ({ id, ...req }))
          .filter((req) => req.email === user.email);
        setMyRequests(arr);
      } else {
        setMyRequests([]);
      }
      setLoadingRequests(false);
    });
    return () => unsubscribe();
  }, [user, refreshKey]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (type: "cities" | "branches", idx: number, value: string) => {
    setForm({
      ...form,
      [type]: form[type].map((v, i) => (i === idx ? value : v))
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!user) return;

    // Validation first
    if (!form.caste.trim()) {
      setFormError("Caste is required.");
      return;
    }
    if (!form.percentage.trim() || isNaN(Number(form.percentage))) {
      setFormError("Percentage is required and must be a number.");
      return;
    }
    const perc = Number(form.percentage);
    if (perc < 0 || perc > 100) {
      setFormError("Percentage must be between 0 and 100.");
      return;
    }
    if (!Array.isArray(form.cities) || form.cities.length < 3 || form.cities.some(city => !city.trim())) {
      setFormError("Please enter at least 3 preferred cities (all fields required).");
      return;
    }
    if (!Array.isArray(form.branches) || form.branches.length < 3 || form.branches.some(branch => !branch.trim())) {
      setFormError("Please enter at least 3 preferred branches (all fields required).");
      return;
    }

    // Check premium status and usage limit AFTER validation
    if (!isLoggedIn) {
      setFormError("Please login to use this feature.");
      return;
    }

    if (!isPlusMember) {
      if (usageCount >= 4) {
        setShowPremiumPopup(true);
        return;
      }
      // Increment usage count
      const newCount = usageCount + 1;
      if (user) {
        set(ref(database, `Users/${user.uid}/listGeneratorUsage`), newCount);
      }
      setUsageCount(newCount);
    }

    // Now submit the form
    await push(ref(database, "requestclglist"), {
      ...form,
      email: user.email || "",
      name: user.displayName || "",
      phone: user.phoneNumber || "",
    });
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4 font-poppins">
      <div className="bg-white rounded-3xl p-10 shadow-lg w-full max-w-lg border border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 text-center">Best College List Request</h1>
        <p className="text-slate-600 mb-6 text-center leading-relaxed">
          Request a personalized list of the best colleges for your profile. Our experts will review your details and send you a curated list.
        </p>

        {/* Free Usage Counter - Only show for non-premium users */}
        {isLoggedIn && !isPlusMember && (
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Free Requests Used</span>
              <span className="text-sm font-bold text-slate-900">{usageCount} / 4</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
              <div 
                className="bg-slate-900 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(usageCount / 4) * 100}%` }}
              ></div>
            </div>
            {usageCount >= 4 && (
              <p className="text-xs text-slate-600 mt-2">You've reached your free limit. <Link href="/counselling/premium" className="text-slate-900 font-bold hover:underline">Upgrade to Premium</Link> for unlimited requests.</p>
            )}
          </div>
        )}

        {/* My Requests Section */}
        {user && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">My Requests</h2>
              <button
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-sm font-semibold transition"
                onClick={() => { setLoadingRequests(true); setRefreshKey(k => k + 1); }}
              >
                Refresh
              </button>
            </div>
            {loadingRequests ? (
              <div className="text-slate-500 text-sm">Loading...</div>
            ) : myRequests.length === 0 ? (
              <div className="text-slate-500 text-sm">No requests found.</div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((req) => (
                  <div key={req.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="text-sm space-y-1">
                        <div className="font-semibold text-slate-800">Caste: <span className="font-normal text-slate-600">{req.caste}</span></div>
                        <div className="font-semibold text-slate-800">% Marks: <span className="font-normal text-slate-600">{req.percentage}</span></div>
                        <div className="font-semibold text-slate-800">Cities: <span className="font-normal text-slate-600">{Array.isArray(req.cities) ? req.cities.join(", ") : req.cities}</span></div>
                        <div className="font-semibold text-slate-800">Branches: <span className="font-normal text-slate-600">{Array.isArray(req.branches) ? req.branches.join(", ") : req.branches}</span></div>
                        <div className="font-semibold text-slate-800">Status: <span className="font-normal capitalize text-slate-600" >{req.status || <span className='text-slate-400'>Not set by admin</span>}</span></div>
                      </div>
                      <div>
                        {req.adminClgListUrl ? (
                          req.adminClgListUrl.endsWith('.pdf') ? (
                            <a href={req.adminClgListUrl} target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-black underline font-semibold text-sm">View PDF List</a>
                          ) : (
                            <a href={req.adminClgListUrl} target="_blank" rel="noopener noreferrer" className="group">
                              <img src={req.adminClgListUrl} alt="College List" className="w-32 h-20 object-cover rounded-lg shadow-sm border border-slate-200 group-hover:scale-105 transition duration-200" />
                              <div className="text-slate-900 group-hover:text-black underline font-semibold text-xs mt-1 text-center">View List</div>
                            </a>
                          )
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">List not uploaded yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Only show form if user has not submitted a request */}
        {submitted ? (
          <div className="text-emerald-600 text-center font-semibold mb-4 bg-emerald-50 py-3 rounded-2xl border border-emerald-100">Your request has been submitted! Our team will contact you soon.</div>
        ) : myRequests.length === 0 ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formError && (
              <div className="bg-slate-50 text-slate-800 px-4 py-2.5 rounded-2xl text-center font-semibold mb-2 border border-slate-200 text-sm">{formError}</div>
            )}
            <input
              type="text"
              name="caste"
              value={form.caste}
              onChange={handleChange}
              required
              placeholder="Enter your caste"
              className="w-full border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-2.5 text-gray-900 bg-white outline-none transition"
            />
            <input
              type="number"
              name="percentage"
              value={form.percentage}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.01"
              placeholder="Enter your percentage"
              className="w-full border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-2.5 text-gray-900 bg-white outline-none transition"
            />
            <div>
              <label className="block mb-2 font-semibold text-slate-800 text-sm">Preferred Cities (add 3 or more cities)</label>
              {form.cities.map((city, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={city}
                  onChange={e => handleArrayChange("cities", idx, e.target.value)}
                  placeholder={`City ${idx + 1}`}
                  className="w-full border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-2 mb-2 text-gray-900 bg-white outline-none transition"
                />
              ))}
            </div>
            <div>
              <label className="block mb-2 font-semibold text-slate-800 text-sm">Preferred Branches (add 3 or more branches)</label>
              {form.branches.map((branch, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={branch}
                  onChange={e => handleArrayChange("branches", idx, e.target.value)}
                  placeholder={`Branch ${idx + 1}`}
                  className="w-full border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl px-4 py-2 mb-2 text-gray-900 bg-white outline-none transition"
                />
              ))}
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-md hover:bg-black transition duration-300"
            >
              Submit Request
            </button>
          </form>
        ) : null}

        {/* ── Premium Popup ── */}
        <AnimatePresence>
          {showPremiumPopup && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-700 to-slate-900"></div>
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-900 shadow-sm border border-slate-200 text-3xl">
                  👑
                </div>
                <h3 className="text-3xl font-black mb-3 text-slate-900 tracking-tight">Free Limit Reached</h3>
                <p className="mb-8 text-base text-slate-500 leading-relaxed font-medium px-4">
                  You have used your 4 free college list requests. Upgrade to Premium to get unlimited access, full CAP round support, and 1:1 expert mentorship.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/counselling/premium"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all shadow-lg text-sm flex items-center justify-center gap-2">
                    Upgrade to Premium
                  </Link>
                  <button onClick={() => setShowPremiumPopup(false)}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
