import {defineConfig, globalIgnores} from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import boundaries from "eslint-plugin-boundaries";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // Layer rules + deep-import ban + import sorting
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      boundaries,
      "simple-import-sort": simpleImportSort,
    },
    settings: {
      "boundaries/elements": [
        {type: "app", pattern: "src/app/**"},
        {type: "views", pattern: "src/views/**"},
        {type: "widgets", pattern: "src/widgets/**"},
        {type: "features", pattern: "src/features/**"},
        {type: "entities", pattern: "src/entities/**"},
        {type: "shared", pattern: "src/shared/**"},
      ],
    },
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "boundaries/no-unknown": "warn",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {from: "app", allow: ["views", "widgets", "features", "entities", "shared"]},
            {from: "views", allow: ["widgets", "features", "entities", "shared"]},
            {from: "widgets", allow: ["features", "entities", "shared"]},
            {from: "features", allow: ["entities", "shared"]},
            {from: "entities", allow: ["shared"]},
            {from: "shared", allow: []},
          ],
        },
      ],

      // Public API only (ban deep imports for non-shared layers)
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/features/*/*",
            "@/features/*/*/*",
            "@/features/*/*/*/*",
            "@/entities/*/*",
            "@/entities/*/*/*",
            "@/widgets/*/*",
            "@/widgets/*/*/*",
            "@/views/*/*",
            "@/views/*/*/*",
          ],
        },
      ],

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },

  // Tests: allow deep imports if needed
  {
    files: ["tests/**/*.{ts,tsx}", "src/**/*.{test,spec}.ts", "src/**/*.{test,spec}.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
]);

export default eslintConfig;
