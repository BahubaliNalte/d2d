"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, remove } from "firebase/database";

export type User = {
  uid: string;
  name: string;
  email: string;
  phone: string;
};

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(database, "Users");
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([uid, user]: [string, any]) => ({
          uid,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || user["mobile no"] || user.mobile || "",
        }));
        setUsers(arr);
      } else {
        setUsers([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  const handleDelete = async (uid: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await remove(ref(database, `Users/${uid}`));
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2.5 border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition w-full md:w-80 text-sm"
        />
        <span className="text-slate-500 text-sm font-medium">Total: {users.length}</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Phone</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 text-slate-800 font-medium">{u.name}</td>
                  <td className="py-4 px-6 text-slate-600">{u.email}</td>
                  <td className="py-4 px-6 text-slate-600">{u.phone}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleDelete(u.uid)}
                      className="px-3 py-1.5 rounded-xl bg-red-500 text-white hover:bg-red-600 text-xs font-semibold transition"
                    >
                      Delete
                    </button>
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
