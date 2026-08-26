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

export function getYouTubeIFrameFallback(src: string): string | undefined {
	let url: URL;
	try {
		url = new URL(src);
	} catch {
		return undefined;
	}

	if (url.hostname !== "youtube.com" && url.hostname !== "www.youtube.com") {
		return undefined;
	}

	const videoId =
		url.pathname === "/watch" ? url.searchParams.get("v") : undefined;
	if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return undefined;

	return `https://www.youtube.com/embed/${videoId}`;
}

export function getIFramePlaybackSrc(
	linkSrc: string,
	providerIFrameSrc?: string,
): string {
	return providerIFrameSrc ?? getYouTubeIFrameFallback(linkSrc) ?? linkSrc;
}
