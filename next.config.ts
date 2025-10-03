import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // External packages that should not be bundled by webpack
  serverExternalPackages: ["@node-rs/argon2", "postgres"],

  // Webpack configuration for client-side libraries
  webpack: (config, { isServer }) => {
    // Ensure XLSX works properly in production builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        util: false,
        buffer: false,
        assert: false,
      };
    }
    return config;
  },

  // Experimental features configuration
  experimental: {
    // Configure server actions
    serverActions: {
      // Increase body size limit for server actions to handle larger imports
      bodySizeLimit: "3mb", // Increased from default 1MB
    },
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
