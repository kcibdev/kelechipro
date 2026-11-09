// @ts-check
/**
 * Strict ESLint config (flat config, ESLint 9).
 *
 * Layers, in order:
 *  1. Next.js core-web-vitals + TypeScript presets (React, hooks, a11y basics, @next/next).
 *  2. typescript-eslint strict-type-checked + stylistic-type-checked (uses the TS program).
 *  3. jsx-a11y strict.
 *  4. Project rules: correctness and consistency on top of the presets.
 *
 * Run: `npm run lint` (fails on any warning), `npm run lint:fix` to auto-fix.
 */
import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([".next/**", "out/**", "node_modules/**", "public/**", "next-env.d.ts", "*.tsbuildinfo"]),

  js.configs.recommended,
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },

  // jsx-a11y strict (the plugin itself is already registered by the Next preset).
  { rules: jsxA11y.flatConfigs.strict.rules },

  {
    rules: {
      /* ── Correctness ── */
      eqeqeq: ["error", "always"],
      curly: ["error", "multi-line", "consistent"],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-eval": "error",
      "no-implied-eval": "off", // superseded by @typescript-eslint/no-implied-eval
      "no-new-func": "error",
      "no-param-reassign": ["error", { props: false }],
      "no-return-assign": ["error", "always"],
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unmodified-loop-condition": "error",
      "no-unreachable-loop": "error",
      "no-useless-concat": "error",
      "no-useless-rename": "error",
      "no-useless-return": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "object-shorthand": ["error", "always"],
      radix: "error",
      "array-callback-return": ["error", { checkForEach: false }],
      "default-case-last": "error",
      "no-else-return": ["error", { allowElseIf: false }],

      /* ── TypeScript ── */
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "all", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/no-shadow": "error",

      /* ── React ── */
      "react/self-closing-comp": "error",
      "react/jsx-no-useless-fragment": ["error", { allowExpressions: true }],
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
      "react/no-array-index-key": "error",
      "react/no-unstable-nested-components": "error",
      "react/jsx-no-leaked-render": ["error", { validStrategies: ["ternary", "coerce"] }],
      "react/hook-use-state": "error",
      "react/button-has-type": "error",
      "react/jsx-key": ["error", { checkFragmentShorthand: true, warnOnDuplicates: true }],
      "react-hooks/exhaustive-deps": "error",

      /* ── Imports ── */
      "import/no-duplicates": "error",
      "import/no-cycle": "error",
      "import/no-self-import": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-anonymous-default-export": "error",
    },
  },

  // Plain JS/MJS config files aren't part of the TS program.
  {
    files: ["**/*.{js,mjs,cjs}"],
    extends: [tseslint.configs.disableTypeChecked],
  },
]);
