// The linter half of the gate. tsc (strict, noUncheckedIndexedAccess) remains
// the semantic authority; eslint adds what the compiler deliberately does not
// check — misused promises, floating rejections, redundant type assertions —
// and prettier owns layout, so every stylistic rule is switched off via
// eslint-config-prettier. Rules are tuned against this tree: a rule that fights
// an idiom the codebase uses on purpose is turned off HERE, with the reason,
// rather than silenced inline where it would read as a wart.
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/", "node_modules/"] },
  {
    files: ["src/**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked, prettier],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // KernelBackend is an async interface; implementations that answer from
      // memory are still async because their siblings await. Removing the
      // keyword to please this rule would trade a uniform contract for churn.
      "@typescript-eslint/require-await": "off",
      // An initializer that exists so TypeScript can prove definite assignment
      // across a try block reads as "useless" to this rule; the alternative it
      // suggests does not compile under strict.
      "no-useless-assignment": "off",
      // Interface implementations keep parameters they do not use; the
      // underscore is the declared way to say so (transport.ts's _options).
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    },
  },
);
