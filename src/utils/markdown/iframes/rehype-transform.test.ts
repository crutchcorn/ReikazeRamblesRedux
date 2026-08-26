const { fetchPageHtml } = vi.hoisted(() => ({
	fetchPageHtml: vi.fn(),
}));

vi.mock("utils/fetch-page-html", () => ({
	fetchPageHtml,
	getPageTitle: vi.fn(),
}));

import { fetchPageInfo } from "./rehype-transform";

describe("fetchPageInfo", () => {
	afterEach(() => {
		vi.clearAllMocks();
		vi.unstubAllGlobals();
	});

	it("gets the playable YouTube URL from noembed when the page fetch fails", async () => {
		const publicUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
		const iframeSrc =
			"https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed";
		fetchPageHtml.mockResolvedValue(null);
		const fetchMock = vi.fn().mockResolvedValue({
			status: 200,
			json: async () => ({
				title: "Video title",
				thumbnail_url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
				html: `<iframe src="${iframeSrc}"></iframe>`,
			}),
		});
		vi.stubGlobal("fetch", fetchMock);

		await expect(fetchPageInfo(publicUrl)).resolves.toEqual({
			title: "Video title",
			thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
			iframeSrc,
			iconFile: "/link.png",
		});
		expect(fetchMock).toHaveBeenCalledWith(
			`https://noembed.com/embed?dataType=json&url=${encodeURIComponent(publicUrl)}`,
		);
	});
});
