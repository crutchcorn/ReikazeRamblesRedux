import * as fs from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { Element, Parent } from "hast";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function cleanHTML(fileLocation: string) {
	const contents = await fs.promises.readFile(fileLocation, "utf-8");

	const unifiedChain = unified()
		.use(rehypeParse, { fragment: true } as never)
		.use(() => (tree) => {
			let thePostNode = null;
			visit(tree, "element", (node: Element) => {
				const classes = node.properties.className as string;
				if (classes?.includes("post-content")) {
					thePostNode = node;
				}
			});
			const newTree = { type: "root", children: [thePostNode] };
			visit(
				newTree,
				"element",
				(node: Element, index: number, parent: Parent) => {
					const classes = node.properties.className as string;
					const isNoScript = node.tagName === "noscript";
					const noScriptContent = node.children?.[0];
					const isPreviousClosestSiblingImg =
						(parent.children[index - 1] as Element)?.tagName === "img";
					if (
						classes?.includes("ezoic-autoinsert-video") ||
						classes?.includes("rll-youtube-player") ||
						classes?.includes("ezoic-autoinsert-ad") ||
						node.properties["ez-dt"] === "video" ||
						(isNoScript &&
							noScriptContent?.type === "element" &&
							(noScriptContent as Element).tagName === "iframe")
					) {
						parent.children.splice(index, 1);
					}
					if (
						isNoScript &&
						noScriptContent?.type === "element" &&
						(noScriptContent as Element).tagName === "img" &&
						isPreviousClosestSiblingImg
					) {
						// Remove the previous img tag and unwrap the inner img from the noscript
						const oldSrc = noScriptContent.properties.src as string;
						const newSrc = oldSrc.split("/").pop();
						(noScriptContent as Element).properties = {
							src: "./" + newSrc,
							alt: noScriptContent.properties.title || noScriptContent.properties.alt,
						};
						parent.children[index] = noScriptContent;
						parent.children.splice(index - 1, 1);
					}
				},
			);
			return newTree;
		})
		.use(rehypeStringify, { allowDangerousHtml: true });

	const result = await unifiedChain.process(contents);
	await fs.promises.writeFile(fileLocation, result.toString(), "utf-8");
}

// Get all folders in this directory, get the `index.html` file in each folder
const folders = fs
	.readdirSync(__dirname, { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory());

for (const folder of folders) {
	const folderPath = resolve(__dirname, folder.name);
	const filePath = resolve(folderPath, "index.html");
	cleanHTML(filePath);
}
