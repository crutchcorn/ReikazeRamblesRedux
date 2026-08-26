import { getCanonicalIframeLink } from "./canonical-link";

describe("getCanonicalIframeLink", () => {
	it.each([
		[
			"https://www.youtube.com/embed/dQw4w9WgXcQ",
			"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		],
		[
			"https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
			"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		],
		[
			"https://youtu.be/dQw4w9WgXcQ?si=tracking-value&t=42s",
			"https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
		],
		[
			"https://www.youtube.com/shorts/dQw4w9WgXcQ?feature=share",
			"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		],
		[
			"https://www.youtube.com/live/dQw4w9WgXcQ?si=tracking-value",
			"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
		],
	])("turns %s into a canonical watch URL", (src, expected) => {
		expect(getCanonicalIframeLink(src)).toBe(expected);
	});

	it("keeps playlist and playback context", () => {
		expect(
			getCanonicalIframeLink(
				"https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed&list=PL123&index=2&start=90",
			),
		).toBe(
			"https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123&index=2&t=90s",
		);
	});

	it("turns an embedded playlist into a public playlist URL", () => {
		expect(
			getCanonicalIframeLink(
				"https://www.youtube.com/embed/videoseries?list=PL123",
			),
		).toBe("https://www.youtube.com/playlist?list=PL123");
	});

	it.each([
		"https://example.com/embed/dQw4w9WgXcQ",
		"https://www.youtube.com/channel/example",
		"not a URL",
	])("leaves %s unchanged", (src) => {
		expect(getCanonicalIframeLink(src)).toBe(src);
	});
});
