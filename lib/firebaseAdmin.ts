// lib/firebaseAdmin.ts

import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";
import fs from "fs";
import path from "path";

if (!admin.apps.length) {
  let credential: admin.ServiceAccount | undefined;

  // 1. Try to load from environment variables first (ideal for production / CI/CD)
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    credential = {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n").replace(/^"/, "").replace(/"$/, ""),
    };
  } else {
    // 2. Fallback: try to read serviceAccountKey.json dynamically using fs
    // This prevents Webpack / Next.js from failing at compile-time if the JSON is missing
    try {
      const jsonPath = path.join(process.cwd(), "serviceAccountKey.json");
      if (fs.existsSync(jsonPath)) {
        const fileContent = fs.readFileSync(jsonPath, "utf8");
        credential = JSON.parse(fileContent) as ServiceAccount;
      }
    } catch (error) {
      console.warn("Failed to load serviceAccountKey.json dynamically:", error);
    }
  }

  const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;

  if (credential) {
    admin.initializeApp({
      credential: admin.credential.cert(credential),
      databaseURL,
    });
  } else {
    // 3. Final fallback: try to use application default credentials
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL,
      });
    } catch (error) {
      console.error("Firebase Admin could not be initialized with any credentials:", error);
    }
  }
}

export default admin;

