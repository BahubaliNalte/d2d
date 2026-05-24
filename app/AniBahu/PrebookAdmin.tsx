"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref as dbRef, onValue } from "firebase/database";

export default function PrebookAdmin() {
  const [prebooks, setPrebooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prebookRef = dbRef(database, "prebook");
    const unsubscribe = onValue(prebookRef, (snapshot) => {
      const arr: any[] = [];
      snapshot.forEach(child => {
        arr.push({ id: child.key, ...child.val() });
      });
      setPrebooks(arr.reverse());
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-indigo-600">Prebooked Users</h1>
      {loading ? (
        <div className="text-slate-500">Loading...</div>
      ) : prebooks.length === 0 ? (
        <div className="text-slate-500">No prebooked users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 bg-white text-sm">
            <thead>
              <tr className="bg-slate-50/75">
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Name</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Phone</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-700">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prebooks.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 text-slate-800 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-slate-600">{user.phone}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
