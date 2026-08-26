import { defineConfig } from "astro/config";

import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import { EnumChangefreq as ChangeFreq } from "sitemap";
import { siteUrl } from "./src/constants/site-config";
import { symlinkDir } from "symlink-dir";
import * as path from "path";
import { astroIntegrationCopyGenerated } from "./src/utils/markdown/astro-integration-copy-generated";

await symlinkDir(path.resolve("content"), path.resolve("public/content"));

export default defineConfig({
	site: siteUrl,
	output: "static",
	base: "/ReikazeRamblesRedux",
	integrations: [
		icon(),
		preact({ compat: true }),
		sitemap({
			changefreq: ChangeFreq.DAILY,
			priority: 0.7,
			lastmod: new Date(),
			serialize({ url, ...rest }) {
				return {
					// remove trailing slash from sitemap URLs
					url: url.replace(/\/$/g, ""),
					...rest,
				};
			},
		}),
		astroIntegrationCopyGenerated(),
	],
	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					fatalDeprecations: ["import", "global-builtin"],
					loadPaths: [process.cwd()],
				},
			},
		},
		optimizeDeps: {
			exclude: ["msw", "msw/node", "sharp"],
		},
		ssr: {
			external: ["svgo"],
			noExternal: [
				"react-aria",
				"react-stately",
				/@react-aria/,
				/@react-stately/,
				/@react-types/,
			],
		},
	},
});
