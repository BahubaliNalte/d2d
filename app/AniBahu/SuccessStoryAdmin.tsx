"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref as dbRef, onValue, push, remove } from "firebase/database";

export type SuccessStory = {
  id: string;
  student: string;
  score: string;
  clg: string;
  branch: string;
  type: string;
  linkedin: string;
};

export default function SuccessStoryAdmin() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    student: "",
    score: "",
    clg: "",
    branch: "",
    type: "CAP Rd 1",
    linkedin: ""
  });

  useEffect(() => {
    const storiesRef = dbRef(database, "SuccessStories");
    const unsubscribe = onValue(storiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, s]: [string, any]) => ({
          id,
          student: s.student || "",
          score: s.score || "",
          clg: s.clg || "",
          branch: s.branch || "",
          type: s.type || "",
          linkedin: s.linkedin || ""
        }));
        setStories(arr);
      } else {
        setStories([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student || !formData.clg) return;
    setSuccessMsg("");
    try {
      await push(dbRef(database, "SuccessStories"), formData);
      setSuccessMsg("Success story added!");
      setFormData({ student: "", score: "", clg: "", branch: "", type: "CAP Rd 1", linkedin: "" });
    } catch (err) {
      setSuccessMsg("Failed to add story. Try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this success story?")) {
      await remove(dbRef(database, `SuccessStories/${id}`));
    }
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
          <input type="text" required value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})} className="w-full p-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-slate-400" placeholder="e.g. Rohan Deshmukh" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Diploma Score / Rank</label>
          <input type="text" required value={formData.score} onChange={e => setFormData({...formData, score: e.target.value})} className="w-full p-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-slate-400" placeholder="e.g. 96.40%" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">College</label>
          <input type="text" required value={formData.clg} onChange={e => setFormData({...formData, clg: e.target.value})} className="w-full p-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-slate-400" placeholder="e.g. COEP, Pune" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Branch</label>
          <input type="text" required value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-full p-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-slate-400" placeholder="e.g. Computer" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Admission Type</label>
          <input type="text" required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-slate-400" placeholder="e.g. CAP Rd 1" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn URL (Optional)</label>
          <input type="url" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} className="w-full p-2 border border-slate-200 rounded-xl outline-none text-sm focus:border-slate-400" placeholder="https://linkedin.com/in/..." />
        </div>
        
        <div className="md:col-span-2 mt-2">
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition text-sm w-full md:w-auto shadow-sm">
            Add Success Story
          </button>
          {successMsg && <span className="ml-4 text-sm font-semibold text-emerald-600">{successMsg}</span>}
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <h3 className="text-lg font-bold p-6 bg-slate-50 border-b border-slate-200 text-slate-900">All Placed Students</h3>
        {loading ? (
          <div className="p-6 text-slate-500 text-sm font-medium">Loading...</div>
        ) : stories.length === 0 ? (
          <div className="p-6 text-slate-500 text-sm font-medium">No success stories added yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-bold text-slate-700">Student</th>
                  <th className="px-6 py-3 font-bold text-slate-700">Score</th>
                  <th className="px-6 py-3 font-bold text-slate-700">College</th>
                  <th className="px-6 py-3 font-bold text-slate-700">Branch</th>
                  <th className="px-6 py-3 font-bold text-slate-700">LinkedIn</th>
                  <th className="px-6 py-3 font-bold text-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stories.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-900">{s.student}</td>
                    <td className="px-6 py-4 text-slate-600">{s.score}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{s.clg}</td>
                    <td className="px-6 py-4 text-slate-600">{s.branch} <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md ml-1">{s.type}</span></td>
                    <td className="px-6 py-4">
                      {s.linkedin ? <a href={s.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Link</a> : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 font-bold transition text-xs bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
