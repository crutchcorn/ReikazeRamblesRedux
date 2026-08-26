import type { Element } from "hast";
import { fromHtml } from "hast-util-from-html";
import { visit } from "unist-util-visit";

export function getIFrameSrc(html: string): string | undefined {
	const tree = fromHtml(html);
	let src: string | undefined;

	visit(tree, { tagName: "iframe" }, (node: Element) => {
		if (node.properties.src) src = String(node.properties.src);
	});

	return src;
}
