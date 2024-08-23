import { Feed } from "feed";
import { siteUrl } from "constants/site-config";
import { getPosts, getPersonById } from "utils/api";

export const GET = () => {
	const feed = new Feed({
		title: "Reikaze Rambles' JSON Feed",
		description:
			"The new home for RockmanDash Reviews",
		id: siteUrl,
		link: siteUrl,
		language: "en",
		image: `${siteUrl}/image.png`,
		favicon: `${siteUrl}/favicon.ico`,
		copyright: `Contributor's rights reserved ${new Date().getFullYear()}, Reikaze Rambles`,
		feedLinks: {
			rss: `${siteUrl}/rss.xml`,
			atom: `${siteUrl}/atom.xml`,
			json: `${siteUrl}/feed.json`,
		},
	});

	getPosts().forEach((post) => {
		const nodeUrl = `${siteUrl}/posts/${post.slug}`;

		feed.addItem({
			title: post.title,
			guid: nodeUrl,
			link: nodeUrl,
			description: post.description,
			content: post.excerpt,
			author: post.authors
				.map((id) => getPersonById(id))
				.map((author) => {
					return {
						name: author!.name,
						link: `${siteUrl}/people/${author!.id}`,
					};
				}),
			date: new Date(post.published),
			extensions: [],
		});
	});

	return new Response(feed.json1());
};
