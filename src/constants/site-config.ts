const buildMode = process.env.BUILD_ENV || "production";
const siteUrl = (() => {
	let siteUrl = process.env.SITE_URL || process.env.VERCEL_URL || "";

	if (siteUrl && !siteUrl.startsWith("http")) siteUrl = `https://${siteUrl}`;

	if (!siteUrl) {
		switch (buildMode) {
			case "production":
				return "https://reikazerambles.com";
			case "development":
				return "http://localhost:3000";
			default:
				return "https://beta.reikazerambles.com";
		}
	}

	return siteUrl;
})();

// To set for Twitch player embedding in blog posts
let parent = new URL(siteUrl).host;

// Twitch embed throws error with strings like 'localhost:3000', but
// those persist with `new URL().host`
if (parent.startsWith("localhost")) {
	parent = "localhost";
}

const siteMetadata = {
	title: `Reikaze Rambles`,
	description: `The new home for RockmanDash Reviews`,
	siteUrl,
	repoPath: "reikaze/ReikazeRambles",
	relativeToPosts: "/content/blog",
	keywords:
		"anime,manga,reviews,game reviews,gaming",
	twitterHandle: "@reikazerambles",
};

export { parent, siteUrl, buildMode, siteMetadata };
