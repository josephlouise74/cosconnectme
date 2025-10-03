import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import jsxA11y from "eslint-plugin-jsx-a11y";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends(
        "next/core-web-vitals",
        "next/typescript",
        "plugin:jsx-a11y/recommended"
    ),
    {
        plugins: {
            "jsx-a11y": jsxA11y
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off", // Changed to "off" to allow any type
            "jsx-a11y/label-has-for": ["error", {
                required: {
                    some: ["nesting", "id"]
                }
            }]
        }
    }
];

export default eslintConfig;