import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    plugins: {
      prettier: await import("eslint-plugin-prettier").then(m => m.default),
    },
  },
  {
    ignores: [
      // dependencies
      "node_modules/**",
      ".pnp/**",
      ".pnp.js",

      // next.js
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",

      // misc
      "**/.DS_Store",
      "*.pem",

      // debug
      "**/npm-debug.log*",
      "**/yarn-debug.log*",
      "**/yarn-error.log*",
      "**/pnpm-debug.log*",

      // local env files
      "**/.env*.local",

      // vercel
      ".vercel/**",

      // typescript
      "*.tsbuildinfo",
      "next-env.d.ts",

      // coverage
      "coverage/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    settings: {
      next: {
        rootDir: "./",
      },
      react: {
        version: "detect",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "react-hooks/exhaustive-deps": "error",
      "react/no-unescaped-entities": "off",
      "prettier/prettier": "error",
    },
  },
];

export default eslintConfig;
