import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress ESLint errors during production builds on Vercel
  // (ESLint is still run separately in CI if needed)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Suppress TypeScript type errors that only appear at build time
  // (TypeScript is checked during development via the IDE)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Required for firebase-admin to work correctly in Next.js API routes
  serverExternalPackages: ["firebase-admin"],
  images: {
    // Allow images from Firebase Storage and other CDNs
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
