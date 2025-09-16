import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable using experimental features like Turbopack
  experimental: {
    // Use empty object for now - no experimental features enabled
    serverComponentsExternalPackages: ["@node-rs/argon2"],
  },
  // Explicitly declare environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // Configure ESLint to work with src directory
  eslint: {
    dirs: ["src"],
  },
};

export default nextConfig;
