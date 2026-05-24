"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, push, remove } from "firebase/database";

export type Announcement = {
  id: string;
  message: string;
  createdAt: string;
};

export default function AnnouncementAdmin() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const annRef = ref(database, "n&a");
    const unsubscribe = onValue(annRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, a]: [string, any]) => ({
          id,
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    await push(ref(database, "n&a"), {
      message,
      createdAt: new Date().toISOString(),
    });
    setMessage("");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this announcement?")) {
      await remove(ref(database, `n&a/${id}`));
    }
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Enter announcement..."
          className="flex-1 p-2.5 border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition text-sm text-slate-800 bg-white"
        />
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition text-sm shadow-sm">Add</button>
      </form>
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4 text-indigo-600">All Announcements</h3>
        {loading ? (
          <div className="text-slate-500 text-sm">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-slate-500 text-sm">No announcements yet.</div>
        ) : (
          <ul className="space-y-3">
            {announcements.map(a => (
              <li key={a.id} className="flex justify-between items-center border-b border-slate-100 pb-2 text-sm text-slate-700">
                <span>{a.message}</span>
                <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 font-medium transition text-xs">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
