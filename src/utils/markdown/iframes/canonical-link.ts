const youtubeHosts = new Set([
	"youtube.com",
	"www.youtube.com",
	"m.youtube.com",
	"music.youtube.com",
	"youtube-nocookie.com",
	"www.youtube-nocookie.com",
	"youtube.googleapis.com",
]);

const shortYouTubeHosts = new Set(["youtu.be", "www.youtu.be"]);
const youtubeVideoPaths = new Set(["embed", "e", "live", "shorts", "v"]);

function addYouTubePlaybackContext(source: URL, destination: URL) {
	for (const parameter of ["list", "index"]) {
		const value = source.searchParams.get(parameter);
		if (value) destination.searchParams.set(parameter, value);
	}

	const timestamp = source.searchParams.get("t");
	if (timestamp) {
		destination.searchParams.set("t", timestamp);
		return;
	}

	const start = source.searchParams.get("start");
	if (start) {
		destination.searchParams.set(
			"t",
			/^\d+$/.test(start) ? `${start}s` : start,
		);
	}
}

/**
 * Return the public page for an iframe URL when its provider has a distinct
 * embed URL. The iframe still needs the original URL in order to be playable.
 */
export function getCanonicalIframeLink(src: string): string {
	let url: URL;
	try {
		url = new URL(src.startsWith("//") ? `https:${src}` : src);
	} catch {
		return src;
	}

	const isShortYouTubeUrl = shortYouTubeHosts.has(url.hostname);
	if (!isShortYouTubeUrl && !youtubeHosts.has(url.hostname)) return src;

	const pathParts = url.pathname.split("/").filter(Boolean);
	const [pathType, pathValue] = pathParts;

	if (
		!isShortYouTubeUrl &&
		((pathType === "embed" && pathValue === "videoseries") ||
			pathType === "playlist")
	) {
		const playlistId = url.searchParams.get("list");
		if (!playlistId) return src;

		const playlistUrl = new URL("https://www.youtube.com/playlist");
		playlistUrl.searchParams.set("list", playlistId);
		return playlistUrl.toString();
	}

	let videoId: string | null | undefined;
	if (isShortYouTubeUrl) {
		videoId = pathType;
	} else if (pathType === "watch") {
		videoId = url.searchParams.get("v");
	} else if (youtubeVideoPaths.has(pathType)) {
		videoId = pathValue;
	}

	if (!videoId || videoId === "live_stream" || videoId === "videoseries") {
		return src;
	}

	const watchUrl = new URL("https://www.youtube.com/watch");
	watchUrl.searchParams.set("v", videoId);
	addYouTubePlaybackContext(url, watchUrl);
	return watchUrl.toString();
}
