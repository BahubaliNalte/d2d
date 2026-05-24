"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, update, remove } from "firebase/database";

export type MentorshipRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status?: string;
  date?: string;
  time?: string;
};

export default function MentorshipRequestTable() {
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reqRef = ref(database, "mentorshipRequests");
    const unsubscribe = onValue(reqRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, req]: [string, any]) => ({
          id,
          name: req.name || "",
          email: req.email || "",
          phone: req.phone || "",
          status: req.status || "pending",
          date: req.date || "",
          time: req.time || "",
        }));
        setRequests(arr);
      } else {
        setRequests([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAccept = async (id: string, date: string, time: string) => {
    await update(ref(database, `mentorshipRequests/${id}`), { status: "accepted", date, time });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this mentorship request?")) {
      await remove(ref(database, `mentorshipRequests/${id}`));
    }
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm mb-8">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Phone</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">Time</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-500">
                  Loading requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-slate-500">
                  No requests found.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 text-slate-800 font-medium">{r.name}</td>
                  <td className="py-4 px-6 text-slate-600">{r.email}</td>
                  <td className="py-4 px-6 text-slate-600">{r.phone}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      r.status === 'accepted' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {r.status || 'pending'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600">{r.date || "-"}</td>
                  <td className="py-4 px-6 text-slate-600">{r.time || "-"}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {r.status === "pending" ? (
                        <AcceptMentorshipRequest id={r.id} onAccept={handleAccept} />
                      ) : (
                        <span className="text-emerald-600 font-semibold text-xs">Accepted</span>
                      )}
                      <button
                        className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AcceptMentorshipRequest({ id, onAccept }: { id: string; onAccept: (id: string, date: string, time: string) => void }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl">
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-2 py-1 text-xs" />
      <input type="time" value={time} onChange={e => setTime(e.target.value)} className="border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg px-2 py-1 text-xs" />
      <button
        className="bg-emerald-600 text-white px-2 py-1 rounded-lg text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
        onClick={() => onAccept(id, date, time)}
        disabled={!date || !time}
      >
        Accept
      </button>
    </div>
  );
}
