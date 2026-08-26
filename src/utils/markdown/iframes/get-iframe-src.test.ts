import {
	getIFramePlaybackSrc,
	getIFrameSrc,
	getYouTubeIFrameFallback,
} from "./get-iframe-src";

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

describe("getYouTubeIFrameFallback", () => {
	it("creates an iframe-safe URL from a canonical watch URL", () => {
		expect(
			getYouTubeIFrameFallback("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
		).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
	});

	it.each([
		"https://example.com/watch?v=dQw4w9WgXcQ",
		"https://www.youtube.com/watch?v=invalid",
		"not a URL",
	])("does not create a fallback for %s", (src) => {
		expect(getYouTubeIFrameFallback(src)).toBeUndefined();
	});
});

describe("getIFramePlaybackSrc", () => {
	it("prefers the provider iframe URL", () => {
		expect(
			getIFramePlaybackSrc(
				"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
				"https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed",
			),
		).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed");
	});

	it("uses an iframe-safe fallback when provider data is unavailable", () => {
		expect(
			getIFramePlaybackSrc("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
		).toBe("https://www.youtube.com/embed/dQw4w9WgXcQ");
	});

	it("keeps non-YouTube iframe sources unchanged", () => {
		expect(getIFramePlaybackSrc("https://example.com/embed/123")).toBe(
			"https://example.com/embed/123",
		);
	});
});
