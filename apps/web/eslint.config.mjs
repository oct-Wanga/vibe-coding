import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

import boundaries from "eslint-plugin-boundaries";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "@typescript-eslint/eslint-plugin";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";

import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Base rules (all source files)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      boundaries,
      "simple-import-sort": simpleImportSort,
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
      unicorn,
      sonarjs,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "views", pattern: "src/views/**" },
        { type: "widgets", pattern: "src/widgets/**" },
        { type: "features", pattern: "src/features/**" },
        { type: "entities", pattern: "src/entities/**" },
        { type: "shared", pattern: "src/shared/**" },

        // (선택) src/lib 같이 쓰고 싶으면 unknown 방지용으로 추가
        { type: "shared", pattern: "src/lib/**" },
      ],
    },
    rules: {
      // ✅ React Hooks rules (권장: ON)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // ✅ Prettier와 충돌 방지(ESLint formatting rule off)
      ...prettierConfig.rules,

      // ✅ Prettier 포맷 위반을 ESLint 에러로 표시
      "prettier/prettier": "error",

      // ✅ boundaries (layer 규칙)
      "boundaries/no-unknown": "warn",
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: "app", allow: ["views", "widgets", "features", "entities", "shared"] },
            { from: "views", allow: ["widgets", "features", "entities", "shared"] },
            { from: "widgets", allow: ["features", "entities", "shared"] },
            { from: "features", allow: ["entities", "shared"] },
            { from: "entities", allow: ["shared"] },
            { from: "shared", allow: [] },
          ],
        },
      ],

      // ✅ Public API only (deep import ban)
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

      // ✅ Import sorting
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // =========================
      // ✅ Style guide rules
      // =========================

      // Declarations
      "no-var": "error",
      "prefer-const": "error",
      "no-multi-assign": "error",

      // Security / correctness
      "no-eval": "error",
      eqeqeq: ["error", "always"],

      // Objects / Arrays
      "object-shorthand": ["error", "always"],
      "prefer-object-spread": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "no-unneeded-ternary": "error",

      // TypeScript safety
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // (선택) 너무 빡세면 warn으로 낮춰도 됨
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/cognitive-complexity": ["warn", 15],

      // (선택) 파일명 케이스 강제: Next 예약 파일 예외 때문에 "warn" 추천
      "unicorn/filename-case": [
        "warn",
        {
          cases: { camelCase: true, pascalCase: true },
          ignore: [
            "^page\\.(t|j)sx?$",
            "^layout\\.(t|j)sx?$",
            "^loading\\.(t|j)sx?$",
            "^error\\.(t|j)sx?$",
            "^not-found\\.(t|j)sx?$",
            "^route\\.(t|j)s$",
            "^middleware\\.(t|j)s$",
          ],
        },
      ],
    },
  },

  // ✅ Server Component 경계 보호 (현실적으로 가장 효과 좋음)
  // app 폴더의 라우트 파일들은 기본적으로 "서버"인 경우가 많으니,
  // client-only 라이브러리/훅을 import 하지 못하게 막는다.
  {
    files: [
      "src/app/**/page.{ts,tsx,js,jsx}",
      "src/app/**/layout.{ts,tsx,js,jsx}",
      "src/app/**/loading.{ts,tsx,js,jsx}",
      "src/app/**/error.{ts,tsx,js,jsx}",
      "src/app/**/not-found.{ts,tsx,js,jsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            // client-only libs
            "zustand",
            "@tanstack/react-query",
            "react-hook-form",

            // 너희 프로젝트 client-only 폴더가 있다면 여기 추가(추천)
            "@/shared/stores/*",
            "@/shared/query/*",
          ],
        },
      ],
    },
  },

  // Tests: allow deep imports if needed + any 완화(선택)
  {
    files: ["tests/**/*.{ts,tsx}", "src/**/*.{test,spec}.ts", "src/**/*.{test,spec}.tsx"],
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "unicorn/filename-case": [
        "warn",
        {
          cases: { camelCase: true, pascalCase: true, kebabCase: true },
        },
      ],
    },
  },
]);

export default eslintConfig;
