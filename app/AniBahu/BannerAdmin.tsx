"use client";

import { useEffect, useRef, useState } from "react";
import { database, storage } from "@/lib/firebase";
import { ref as dbRef, onValue, push, remove } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export type Banner = {
  id: string;
  imageUrl: string;
};

export default function BannerAdmin() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const bannerRef = dbRef(database, "banners");
    const unsubscribe = onValue(bannerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, b]: [string, any]) => ({
          id,
          imageUrl: b.imageUrl || "",
        }));
        setBanners(arr);
      } else {
        setBanners([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    setSuccess("");
    try {
      const storagePath = `banners/${Date.now()}_${image.name}`;
      const imgRef = storageRef(storage, storagePath);
      await uploadBytes(imgRef, image);
      const url = await getDownloadURL(imgRef);
      await push(dbRef(database, "banners"), {
        imageUrl: url,
      });
      setSuccess("Image is added");
    } catch (err) {
      setSuccess("Failed to add image. Try again.");
    }
    setImage(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this banner?")) {
      await remove(dbRef(database, `banners/${id}`));
    }
  };

  return (
    <div>
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3 mb-6 items-center">
        <input
          type="file"
          accept="image/*"
          ref={fileInput}
          onChange={e => setImage(e.target.files?.[0] || null)}
          className="p-2 border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-xl outline-none transition text-sm w-full md:w-auto bg-white"
        />
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition text-sm shadow-sm w-full md:w-auto">Add Banner</button>
      </form>
      {success && <div className={`mb-4 text-sm font-semibold ${success.includes('added') ? 'text-emerald-600' : 'text-red-600'}`}>{success}</div>}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
        <h3 className="text-lg font-bold mb-4 text-indigo-600">All Banners</h3>
        {loading ? (
          <div className="text-slate-500 text-sm">Loading...</div>
        ) : banners.length === 0 ? (
          <div className="text-slate-500 text-sm">No banners yet.</div>
        ) : (
          <ul className="space-y-3">
            {banners.map(b => (
              <li key={b.id} className="flex justify-between items-center border-b border-slate-100 pb-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt="Banner" className="w-20 h-12 object-cover rounded-lg shadow-sm" />
                  ) : null}
                </div>
                <button onClick={() => handleDelete(b.id)} className="text-red-500 hover:text-red-700 font-medium transition text-xs">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
