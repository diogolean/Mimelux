export default [
  {
    ignores: ["dist/**", ".next/**", "node_modules/**", "coverage/**"],
  },
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
