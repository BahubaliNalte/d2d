"use client";

import React, { useEffect, useState } from "react";
import { auth, database } from "@/lib/firebase";
import { onAuthStateChanged, signOut, browserLocalPersistence, setPersistence } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaUser, FaEnvelope, FaPhone, FaSignOutAlt, FaCrown } from "react-icons/fa";
import { motion } from "framer-motion";

type UserData = {
  email: string;
  name: string;
  phone: string;
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlusMember, setIsPlusMember] = useState(false);
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [userUid, setUserUid] = useState<string | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).then(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserUid(user.uid);
          setIsGoogleUser(user.providerData.some((p) => p.providerId === "google.com"));
          const userRef = ref(database, `Users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            let phone = data.phone || data["mobile no"] || data.mobile || "";
            if (!phone) {
              const plusRef = ref(database, `PlusMembers/${user.uid}`);
              const plusSnap = await get(plusRef);
              if (plusSnap.exists()) {
                const plusData = plusSnap.val();
                phone = plusData.phone || "";
              }
            }
            setUserData({
              email: data.email || "",
              name: data.name || "",
              phone,
            });
            setShowAddPhone(!phone && user.providerData.some((p) => p.providerId === "google.com"));
          }
          const plusRef = ref(database, `PlusMembers/${user.uid}`);
          const plusSnap = await get(plusRef);
          setIsPlusMember(plusSnap.exists());
        } else {
          setUserData({ email: '', name: '', phone: '' });
          setIsPlusMember(false);
          setShowAddPhone(false);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    });
  }, [router]);

  const handleAddPhone = async () => {
    if (!userUid) {
      console.error("handleAddPhone: missing userUid");
      return;
    }
    const phoneVal = (newPhone || "").trim();
    if (!phoneVal) {
      alert("Please enter a phone number.");
      return;
    }
    // Basic validation: 10 digits (India)
    if (!/^\d{10}$/.test(phoneVal)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    const userRef = ref(database, `Users/${userUid}`);
    try {
      console.log("handleAddPhone: saving phone", phoneVal, "for uid", userUid);
      await update(userRef, { phone: phoneVal });
      console.log("handleAddPhone: saved successfully");
      setUserData((prev) => (prev ? { ...prev, phone: phoneVal } : prev));
      setShowAddPhone(false);
    } catch (err) {
      console.error("handleAddPhone: failed to save phone", err);
      alert("Failed to save phone. Check console for details.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Inter', 'Poppins', sans-serif" }}>
      {/* Back Navigation */}
      <div className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
          id="profile-back"
        >
          <FaArrowLeft className="text-xs" /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-4 shadow-lg shadow-blue-200/50">
                <span className="text-3xl text-white font-bold">
                  {(userData && userData.name) ? userData.name[0].toUpperCase() : "U"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                {userData ? userData.name : ""}
              </h1>
              {isPlusMember && (
                <span className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
                  <FaCrown className="text-amber-500" /> Premium Member
                </span>
              )}
            </div>

            {/* Info Cards */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FaUser className="text-blue-500 text-sm" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Name</p>
                  <p className="text-sm font-medium text-slate-700">{userData ? userData.name : ""}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FaEnvelope className="text-indigo-500 text-sm" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-slate-700">{userData ? userData.email : ""}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <FaPhone className="text-emerald-500 text-sm" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-slate-700">{userData?.phone || "Not provided"}</p>
                </div>
              </div>

              {showAddPhone && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 bg-blue-50/50 rounded-xl border border-blue-100"
                >
                  <p className="text-xs text-blue-600 font-medium mb-2">Add your phone number</p>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      className="input-field text-sm flex-1"
                      placeholder="Enter 10-digit phone"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                    />
                    <button
                      className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
                      onClick={handleAddPhone}
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Logout */}
            <button
              className="w-full py-3 px-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={async () => {
                await signOut(auth);
                router.push("/login");
              }}
              id="profile-logout"
            >
              <FaSignOutAlt /> Log Out
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}