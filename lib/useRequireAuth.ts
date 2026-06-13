"use client";

import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, database } from "./firebase";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";

interface UseRequireAuthOptions {
  requirePremium?: boolean;
}

interface UseRequireAuthResult {
  user: User | null;
  /** True while authentication state and premium check are still resolving */
  loading: boolean;
  /** True once auth + premium check are fully resolved */
  authResolved: boolean;
  isPremium: boolean;
}

/**
 * useRequireAuth
 *
 * Guards a page by checking authentication and (optionally) premium status.
 * - If user is not logged in → redirects to /login
 * - If requirePremium=true and user is not a PlusMember → redirects to /counselling/premium
 *
 * Usage:
 *   const { loading, authResolved, user, isPremium } = useRequireAuth({ requirePremium: true });
 *   if (loading || !authResolved) return <LoadingSpinner />;
 *   if (requirePremium && !isPremium) return null; // redirect in progress
 */
export function useRequireAuth(
  options: UseRequireAuthOptions = {}
): UseRequireAuthResult {
  const { requirePremium = false } = options;
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);

  // Prevent repeated redirects on every re-render / real-time update
  const hasRedirected = useRef(false);

  useEffect(() => {
    hasRedirected.current = false;

    const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // Not logged in — redirect to login immediately
        setUser(null);
        setIsPremium(false);
        setAuthResolved(true);
        setLoading(false);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace("/login");
        }
        return;
      }

      setUser(firebaseUser);

      // Use one-shot get() instead of onValue() to avoid repeated premium
      // checks and repeated redirect calls on every Firebase real-time update.
      try {
        const plusSnap = await get(ref(database, "PlusMembers"));
        let found = false;
        if (plusSnap.exists()) {
          plusSnap.forEach((child) => {
            if (child.val()?.uid === firebaseUser.uid) found = true;
          });
        }
        setIsPremium(found);
        setAuthResolved(true);
        setLoading(false);

        if (requirePremium && !found && !hasRedirected.current) {
          hasRedirected.current = true;
          router.replace("/counselling/premium");
        }
      } catch {
        // Firebase read error — treat as non-premium
        setIsPremium(false);
        setAuthResolved(true);
        setLoading(false);
        if (requirePremium && !hasRedirected.current) {
          hasRedirected.current = true;
          router.replace("/counselling/premium");
        }
      }
    });

    return () => {
      authUnsub();
    };
  }, [requirePremium, router]);

  return { user, loading, isPremium, authResolved };
}
