import * as fs from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function cleanHTML(folderLocation: string) {
	const fileLocation = resolve(folderLocation, "index.md");
	const newFileLocation = resolve(folderLocation, "index.md");
	const contents = await fs.promises.readFile(fileLocation, "utf-8");

	const { data, content } = matter(contents);
	const frontmatter = data as {
		title: string;
		tags: string[];
		published: string;
		kinjaArticle: boolean;
	};

	const unifiedChain = unified()
		.use(rehypeParse, { fragment: true })
		.use(rehypeRemark)
		.use(remarkGfm)
		.use(remarkStringify);

	const result = await unifiedChain.process(content);
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
	await fs.promises.writeFile(newFileLocation, resultString, "utf-8");
}

// Get all folders in this directory, get the `index.html` file in each folder
const folders = fs
	.readdirSync(__dirname, { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory());

for (const folder of folders) {
	const folderPath = resolve(__dirname, folder.name);
	cleanHTML(folderPath);
}
