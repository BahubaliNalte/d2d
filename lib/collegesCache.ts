// lib/collegesCache.ts
import { database } from "./firebase";
import { ref, get } from "firebase/database";

let cachedColleges: any[] | null = null;
let pendingPromise: Promise<any[]> | null = null;

export async function getCollegesFromDb(): Promise<any[]> {
  if (cachedColleges) {
    return cachedColleges;
  }
  if (pendingPromise) {
    return pendingPromise;
  }

  // Check sessionStorage to persist across page reloads in the same tab session
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("cached_clgdb");
      if (stored) {
        cachedColleges = JSON.parse(stored);
        return cachedColleges!;
      }
    } catch (e) {
      console.warn("sessionStorage read failed", e);
    }
  }

  pendingPromise = get(ref(database, "clgdb"))
    .then((snapshot) => {
      const data = snapshot.val();
      let arr: any[] = [];
      if (data) {
        arr = Array.isArray(data) ? data : Object.values(data);
      }
      cachedColleges = arr;
      pendingPromise = null;
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("cached_clgdb", JSON.stringify(arr));
        } catch (e) {
          console.warn("sessionStorage write failed", e);
        }
      }
      return arr;
    })
    .catch((err) => {
      pendingPromise = null;
      throw err;
    });

  return pendingPromise;
}
