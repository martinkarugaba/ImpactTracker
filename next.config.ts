import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // External packages that should not be bundled by webpack
  serverExternalPackages: ["@node-rs/argon2"],

  // Experimental features configuration
  experimental: {
    // Use empty object for now - no experimental features enabled
  },

  // Turbopack configuration to specify correct root directory
  turbopack: {
    root: process.cwd(),
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
