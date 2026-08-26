import { getIFrameSrc } from "./get-iframe-src";

describe("getIFrameSrc", () => {
	it("extracts the playable URL from noembed HTML", () => {
		expect(
			getIFrameSrc(
				'<iframe width="200" height="113" src="https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed" frameborder="0" allowfullscreen></iframe>',
			),
		).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed");
	});

	it("returns undefined when the response has no iframe", () => {
		expect(getIFrameSrc("<p>Video unavailable</p>")).toBeUndefined();
	});
});
