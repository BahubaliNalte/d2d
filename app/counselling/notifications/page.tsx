"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function CounsellingNotifications() {
  const [announcements, setAnnouncements] = useState<{ message: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const annRef = ref(database, "n&a");
    const unsubscribe = onValue(annRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.values(data).map((a: any) => ({
          message: a.message || "",
          createdAt: a.createdAt || "",
        })).sort((a, b) => (b.createdAt.localeCompare(a.createdAt)));
        setAnnouncements(arr);
      } else {
        setAnnouncements([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-10 px-4 font-poppins">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-2xl border border-slate-200">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 text-center flex items-center justify-center gap-2">
          <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>
          Notifications & Announcements
        </h2>
        {loading ? (
          <div className="text-slate-500 text-center py-8">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-slate-500 text-center py-8">No announcements yet.</div>
        ) : (
          <ul className="space-y-5">
            {announcements.map((a, i) => (
              <li key={i} className="bg-white border-l-4 border-slate-900 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-slate-200">
                <span className="text-lg font-medium text-slate-800">{a.message}</span>
                <span className="text-xs text-slate-400 md:text-right mt-2 md:mt-0 font-medium">
                  {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
