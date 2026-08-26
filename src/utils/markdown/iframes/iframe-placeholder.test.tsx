import { Element } from "hast";

import { IFramePlaceholder } from "./iframe-placeholder";

function getElements(node: Element): Element[] {
	return [
		node,
		...node.children.flatMap((child) =>
			child.type === "element" ? getElements(child) : [],
		),
	];
}

describe("IFramePlaceholder", () => {
	it("uses the public link for navigation and the embed URL for playback", () => {
		const embedUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ";
		const publicUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
		const placeholder = IFramePlaceholder({
			height: "480",
			src: embedUrl,
			linkSrc: publicUrl,
			propsToPreserve: "{}",
			pageTitle: "Video title",
			pageIcon: "/link.png",
		});
		expect(placeholder).toMatchObject({ type: "element" });
		const elements = getElements(placeholder);
		const links = elements.filter((node) => node.tagName === "a");
		const playbackNode = elements.find(
			(node) => node.properties?.dataIframeurl,
		);

		expect(links).toHaveLength(2);
		expect(links.map((link) => link.properties?.href)).toEqual([
			publicUrl,
			publicUrl,
		]);
		expect(playbackNode?.properties?.dataIframeurl).toBe(embedUrl);
	});
});
