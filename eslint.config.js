import eslint from "@eslint/js";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

const typescriptRecommended = tseslint.configs.recommended.map((config) => ({
	...config,
	files: ["**/*.{ts,tsx}"],
}));

export default tseslint.config(
	{
		ignores: [
			".astro/**",
			"build-scripts/social-previews/dist/**",
			"dist/**",
			"node_modules/**",
			"package-lock.json",
			"**/*.md",
			"**/*.min.js",
			"content/**",
			"public/content/**",
			"public/generated/**",
		],
	},
	eslint.configs.recommended,
	...typescriptRecommended,
	...astro.configs["flat/recommended"],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			"no-mixed-spaces-and-tabs": "off",
			"no-unused-vars": "off",
			"no-useless-escape": "off",
		},
	},
	{
		files: ["**/*.{ts,tsx}"],
		rules: {
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/no-unused-vars": "off",
		},
	},
);
