import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // These legacy layers are not wired into the current app router runtime.
    "features/**",
    "server/middleware/**",
    "server/redis/**",
    "server/utils/errors.ts",
    "services/shipping/**",
    "services/payment/stripe.ts",
  ]),
]);

export default eslintConfig;
