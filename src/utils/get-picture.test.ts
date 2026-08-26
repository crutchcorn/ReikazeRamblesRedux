import { getPictureAttrs } from "./get-picture";

describe("getPictureAttrs", () => {
	test("renders the original image when no optimized sources are available", () => {
		const result = getPictureAttrs(
			{
				src: "/content/example.png",
				width: 800,
				height: 450,
			},
			{},
		);

		expect(result.sources).toEqual([]);
		expect(result.image).toMatchObject({
			src: "/content/example.png",
			width: 800,
			height: 450,
			decoding: "async",
			loading: "lazy",
		});
	});
});
