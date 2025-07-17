const config = {
  "**/*.{js,mjs,cjs,jsx,ts,tsx}": [
    "next lint --fix --dir src",
    "prettier --write --ignore-unknown",
  ],
  "**/*.{json,md}": ["prettier --write --ignore-unknown"],
};

export default config;
