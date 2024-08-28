import { PostInfo } from "types/index";
import { render } from "preact-render-to-string";
import { VNode, createElement } from "preact";
import sharp from "sharp";
import { Parent } from "unist";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkToRehype from "remark-rehype";
import { findAllAfter } from "unist-util-find-all-after";
import { toString } from "hast-util-to-string";
import rehypeStringify from "rehype-stringify";
import { Layout, PAGE_HEIGHT, PAGE_WIDTH } from "./base";
import { getPersonById } from "utils/api";
import { getPostContentMarkdown } from "utils/get-post-content";

const authorImageCache = new Map<string, string>();

export const renderPostPreviewToString = async (
	layout: Layout,
	post: PostInfo,
) => {
	const authorImageMap = Object.fromEntries(
		await Promise.all(
			post.authors.map(async (authorId) => {
				const author = getPersonById(authorId)!;

				if (authorImageCache.has(author.id))
					return [author.id, authorImageCache.get(author.id)];

				const buffer = await sharp(author.profileImgMeta.absoluteFSPath)
					.resize(90, 90)
					.jpeg({ mozjpeg: true })
					.toBuffer();

				const image = "data:image/jpeg;base64," + buffer.toString("base64");

				authorImageCache.set(author.id, image);
				return [author.id, image];
			}),
		),
	);

	return `
	<!DOCTYPE html>
	<html>
	<head>
	<style>
	${layout.css}

	html, body {
		margin: 0;
		padding: 0;
		width: ${PAGE_WIDTH}px;
		height: ${PAGE_HEIGHT}px;
		position: relative;
		overflow: hidden;
	}
	</style>
	</head>
	<body>
	${render(
		createElement(layout.Component, {
			post,
			width: PAGE_WIDTH,
			height: PAGE_HEIGHT,
			authorImageMap,
		}) as VNode<{}>,
	)}
	</body>
	</html>
	`;
};
