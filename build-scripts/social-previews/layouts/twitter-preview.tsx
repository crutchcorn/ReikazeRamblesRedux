import * as React from "preact";
import { ComponentProps, Layout } from "../base";
import style from "./twitter-preview-css";
import fs from "fs/promises";
import { getPersonById } from "utils/api";

const unicornUtterancesHead = Buffer.from(
	await fs.readFile("src/assets/reikaze-full-logo.png"),
).toString("base64");

const TwitterLargeCard = ({
	post,
	width,
	authorImageMap,
}: ComponentProps) => {
	return (
		<>
			<div className="absoluteFill codeScreenOverlay" />
			<div className="absoluteFill backgroundColor content">
				<img
					style={{position: "absolute", left: 64, top: 64}}
					width={400}
					src={`data:image/png;charset=utf-8;base64,${unicornUtterancesHead}`}
				/>
				<div style="flex-grow: 1; text-align: right;">
					<div class="url">reikazerambles.com</div>
				</div>
				<h1
					style={{
						maxWidth: "100%",
						fontSize: `clamp(300%, 4.5rem, ${
							Math.round(width / post.title.length) * 3
						}px)`,
					}}
				>
					{post.title}
				</h1>
				<div class="row">
					<div class="authorImages">
						{post.authors.map((author) => (
							<img
								key={author}
								src={authorImageMap[author]}
								alt=""
								className="authorImage"
								height={90}
								width={90}
							/>
						))}
					</div>
					<div class="postInfo">
						<span class="authors">
							{post.authors.map((id) => getPersonById(id)!.name).join(", ")}
						</span>
						<span class="date">
							{post.publishedMeta} &nbsp;&middot;&nbsp;{" "}
							{post.wordCount.toLocaleString("en")} words
						</span>
					</div>
				</div>
			</div>
		</>
	);
};

export default {
	name: "twitter-preview",
	css: style,
	Component: TwitterLargeCard,
} as Layout;
