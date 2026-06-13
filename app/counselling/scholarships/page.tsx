"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useRequireAuth } from "@/lib/useRequireAuth";

// Scholarship type
type Scholarship = {
  name: string;
  provider: string;
  eligibility: string;
  amount: string;
  stream: string;
  deadline: string;
  applyLink: string;
};

const casteOptions = [
  "All Castes",
  "EBC",
  "OBC",
  "SC",
  "ST",
  "VJNT",
  "SBC",
  "Minority"
];

export default function ScholarshipsPage() {
  const { loading: authLoading } = useRequireAuth({ requirePremium: false });
  const [caste, setCaste] = useState("");
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scholarshipsRef = ref(database, "fund");
    const unsubscribe = onValue(scholarshipsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data as Record<string, any>).map((item) => ({
          name: item.name || item.title || "Scholarship",
          provider: item.provider || item.by || "",
          eligibility: item.eligibility || item.description || "",
          amount: item.amount || "",
          stream: item.stream || "All Streams",
          deadline: item.deadline || "",
          applyLink: item.link || item.applyLink || "",
        })) as Scholarship[];
        setScholarships(arr);
      } else {
        setScholarships([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Show loading spinner while auth resolves (prevents flash of content)
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-[3px] border-slate-200 border-t-slate-900 animate-spin" />
      </main>
    );
  }

  // Only filter by caste (case-insensitive, fallback to all)
  const filtered = scholarships.filter((s) => {
    if (!caste || caste === "All Castes") return true;
    return (
      (s.eligibility && s.eligibility.toLowerCase().includes(caste.toLowerCase())) ||
      (s.name && s.name.toLowerCase().includes(caste.toLowerCase()))
    );
  });

  const handleNotify = () => {
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-16 md:px-20 font-poppins">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl font-bold text-center text-slate-900 mb-10"
      >
        Scholarships for Diploma to Degree Students
      </motion.h1>

      {/* Caste Filter Only */}
      <div className="mb-10 flex justify-center">
        <select
          value={caste}
          onChange={(e) => setCaste(e.target.value)}
          className="p-3 border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 rounded-xl w-full max-w-xs text-gray-900 bg-white outline-none transition"
        >
          {casteOptions.map((option, i) => (
            <option key={i} value={option === "All Castes" ? "" : option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Scholarship Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-center text-slate-500 text-lg col-span-full">
            Loading scholarships...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 text-lg col-span-full">
            No scholarships found.
          </p>
        ) : (
          filtered.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.4 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 border-l-4 border-l-slate-900 relative flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{s.name}</h2>
                <p className="text-sm text-slate-500 font-medium">Provider: {s.provider || "Government / Institutional"}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={s.applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-sm transition"
                >
                  🔗 Apply Now
                </a>
                <button
                  onClick={() => setSelectedScholarship(s)}
                  className="px-4 py-2 rounded-xl border border-slate-350 text-slate-800 hover:bg-slate-50 font-semibold text-sm transition"
                >
                  📄 View Eligibility
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedScholarship && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-xl shadow-xl relative border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 pr-6">
              {selectedScholarship.name}
            </h3>
            <div className="text-slate-600 text-sm leading-relaxed space-y-4 max-h-[60vh] overflow-y-auto">
              <p>{selectedScholarship.eligibility}</p>
              {selectedScholarship.amount && (
                <p className="font-semibold text-slate-800">Amount: <span className="text-slate-900">{selectedScholarship.amount}</span></p>
              )}
            </div>
            <button
              onClick={() => setSelectedScholarship(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition text-lg"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
