import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { ensureDirectoryExistence } from "./utils";
import { renderPostPreviewToString } from "./shared-post-preview-png";

import twitterPreview from "./layouts/twitter-preview";
import { Layout } from "./base";
import { getPostBySlug } from "utils/api";

export const layouts: Layout[] = [twitterPreview];

const __dirname = dirname(fileURLToPath(import.meta.url));

const post = getPostBySlug("ani-debate-blip-1631831849")!;

const rebuild = async () => {
	console.log("rebuilding...");

	for (const layout of layouts) {
		const html = await renderPostPreviewToString(layout, post);

		const previewHtmlPath = resolve(__dirname, `./dist/${layout.name}.html`);
		ensureDirectoryExistence(previewHtmlPath);
		writeFileSync(previewHtmlPath, html);
	}

	console.log("done");
};

rebuild();
