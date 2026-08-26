import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
		alias: {
			src: fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		environmentOptions: {
			jsdom: {
				url: "http://localhost/",
			},
		},
		setupFiles: ["./vitest.setup.ts"],
	},
});
