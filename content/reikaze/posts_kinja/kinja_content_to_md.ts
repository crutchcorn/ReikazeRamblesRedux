import * as fs from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import remarkFrontmatter from "remark-frontmatter";
import { TYPE_FRONTMATTER } from "../../../src/utils/markdown/remark-process-frontmatter";
import { visit } from "unist-util-visit";
import JSON5 from "json5";
import { Parent } from "hast";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype/lib";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function cleanHTML(folderLocation: string) {
	const fileLocation = resolve(folderLocation, "index.md");
	const contents = await fs.promises.readFile(fileLocation, "utf-8");

	let frontmatter = {} as {
		title: string;
		tags: string[];
		published: string;
		kinjaArticle: boolean;
	};

	const unifiedChain = unified()
		.use(remarkParse, { fragment: true } as never)
		.use(remarkFrontmatter, {
			type: TYPE_FRONTMATTER,
			marker: "-",
		} as never)
		.use(() => (tree, vfile) => {
			visit(
				tree,
				{ type: "frontmatter" },
				(node, index: number, parent: Parent) => {
					const TYPE_FRONTMATTER = "frontmatter";

					interface FrontMatterNode {
						type: typeof TYPE_FRONTMATTER;
						// JS object stringified into frontmatter data
						value: string;
					}

					function isFrontMatterNode(node: any): node is FrontMatterNode {
						return node.type === TYPE_FRONTMATTER;
					}

					if (index === undefined || !parent) return;
					const frontmatterNode: unknown = parent.children.splice(index, 1)[0];
					if (frontmatter && isFrontMatterNode(frontmatterNode)) {
						frontmatter = JSON5.parse(frontmatterNode.value);
					}
				},
			);
		})
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRemark)
		.use(remarkStringify);

	const result = await unifiedChain.process(contents);
	const resultString = `
---
{
	title: "${frontmatter.title}",
	published: "${frontmatter.published}",
	tags: [${frontmatter.tags.map((tag) => `"${tag}"`).join(", ")}],
	kinjaArticle: true
}
---

${result.toString()}
	`.trim();
	await fs.promises.writeFile(fileLocation, resultString, "utf-8");
}

// Get all folders in this directory, get the `index.html` file in each folder
const folders = fs
	.readdirSync(__dirname, { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory());

for (const folder of folders) {
	const folderPath = resolve(__dirname, folder.name);
	cleanHTML(folderPath);
}
