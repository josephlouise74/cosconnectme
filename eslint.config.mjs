import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(
  import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = {
  plugins: {
    "jsx-a11y": require("eslint-plugin-jsx-a11y")
  },
  extends: [
    ...compat.extends(
      "next/core-web-vitals",
      "next/typescript",
      "plugin:jsx-a11y/recommended"
    )
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "jsx-a11y/label-has-for": ["error", {
      required: {
        some: ["nesting", "id"]
      }
    }]
  }
};

export default eslintConfig;