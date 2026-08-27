import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import {
	TYPE_FRONTMATTER,
	remarkProcessFrontmatter,
} from "./remark-process-frontmatter";
import remarkEmbedder, { RemarkEmbedderOptions } from "@remark-embedder/core";
import remarkGfm from "remark-gfm";
import { TwitchTransformer } from "./remark-embedder-twitch";
import oembedTransformer from "@remark-embedder/transformer-oembed";
import remarkToRehype from "remark-rehype";
import rehypeSlug from "rehype-slug-custom-id";
import rehypeRaw from "rehype-raw";
import rehypeUnwrapImages from "rehype-unwrap-images";
import { rehypeTooltips } from "./tooltips/rehype-transform";
import { rehypeHints } from "./hints/rehype-transform";
import { rehypeAstroImageMd } from "./picture/rehype-transform";
import { rehypeUnicornElementMap } from "./rehype-unicorn-element-map";
import { rehypeUnicornIFrameClickToRun } from "./iframes/rehype-transform";
import { rehypeHeaderText } from "./rehype-header-text";
import { rehypeHeaderClass } from "./rehype-header-class";
import { Processor } from "unified";
import { rehypeShikiUU } from "./shiki/rehype-transform";
import rehypeStringify from "rehype-stringify";
import { rehypeCodeblockMeta } from "./shiki/rehype-codeblock-meta";
import { rehypePostShikiTransform } from "./shiki/rehype-post-shiki-transform";

const remarkEmbedderDefault =
	(remarkEmbedder as never as { default: typeof remarkEmbedder }).default ??
	remarkEmbedder;

const oembedTransformerDefault =
	(oembedTransformer as never as { default: typeof oembedTransformer })
		.default ?? oembedTransformer;

export function createHtmlPlugins(unified: Processor) {
	return (
		unified
			.use(remarkParse, { fragment: true } as never)
			.use(remarkFrontmatter, {
				type: TYPE_FRONTMATTER,
				marker: "-",
			} as never)
			.use(remarkProcessFrontmatter)
			.use(remarkGfm)
			/* start remark plugins here */
			.use(
				remarkEmbedderDefault as never,
				{
					transformers: [oembedTransformerDefault, TwitchTransformer],
				} as RemarkEmbedderOptions,
			)
			.use(remarkToRehype, { allowDangerousHtml: true })
			// Images cannot remain wrapped in paragraphs when custom markup expands them.
			.use(rehypeUnwrapImages)
			// This is required to handle unsafe HTML embedded into Markdown
			.use(rehypeRaw, { passThrough: ["mdxjsEsm"] })
			// Do not add the tabs before the slug. We rely on some of the heading
			// logic in order to do some of the subheading logic
			.use(rehypeSlug as never, {
				maintainCase: true,
				removeAccents: true,
				enableCustomId: true,
			})
			/**
			 * Insert custom HTML generation code here
			 */
			.use(rehypeHints)
			.use(rehypeTooltips)
			.use(rehypeAstroImageMd)
			.use(rehypeUnicornIFrameClickToRun)
			.use(rehypeUnicornElementMap)
			.use(rehypeHeaderText)
			.use(rehypeHeaderClass, {
				// the page starts at h3 (under {title} -> "Post content")
				depth: 2,
				// visually, headings should start at h2-h6
				className: (depth: number) =>
					`text-style-headline-${Math.min(depth + 1, 6)}`,
			})
			// Shiki is the last plugin before stringify, to avoid performance issues
			// with node traversal (shiki creates A LOT of element nodes)
			.use(rehypeCodeblockMeta)
			.use(...rehypeShikiUU)
			.use(rehypePostShikiTransform)
			.use(rehypeStringify, { allowDangerousHtml: true, voids: [] })
	);
}
