import * as React from "preact";
import { ComponentProps, Layout } from "../base";
import style from "./banner-css";

function Banner({ post, postHtml }: ComponentProps) {
	return (
		<>
			<div
				className="absoluteFill codeScreenOverlay"
				style={{
					zIndex: -1,
				}}
			/>
		</>
	);
}

export default {
	name: "banner",
	css: style,
	Component: Banner,
} as Layout;
