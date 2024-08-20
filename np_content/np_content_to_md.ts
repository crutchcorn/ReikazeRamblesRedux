import * as fs from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function cleanHTML(folderLocation: string) {
	const fileLocation = resolve(folderLocation, "index.html");
	const fileOutLocation = resolve(folderLocation, "index.md");
	const metaLocation = resolve(folderLocation, "meta.json");
	const contents = await fs.promises.readFile(fileLocation, "utf-8");
	const metaContents = JSON.parse(
		await fs.promises.readFile(metaLocation, "utf-8"),
	) as {
		time: string;
		author: string;
		title: string;
		ogLink: string;
	};

	const unifiedChain = unified()
		.use(rehypeParse, { fragment: true } as never)
		.use(rehypeRemark)
		.use(remarkStringify)

	const result = await unifiedChain.process(contents);
	const resultString = `
---
{
	title: "${metaContents.title}",
	published: "${metaContents.time}",
	ogLink: "${metaContents.ogLink}"
}
---

${result.toString()}
	`.trim();
	await fs.promises.writeFile(fileOutLocation, resultString, "utf-8");
}

// Get all folders in this directory, get the `index.html` file in each folder
const folders = fs
	.readdirSync(__dirname, { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory());

for (const folder of folders) {
	const folderPath = resolve(__dirname, folder.name);
	cleanHTML(folderPath);
}
