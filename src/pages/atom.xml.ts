import { Feed } from "feed";
import { siteUrl } from "constants/site-config";
import { getPosts, getPersonById } from "utils/api";
import { toSiteUrl } from "utils/base-path";

export const GET = () => {
	const feed = new Feed({
		title: "Reikaze Rambles' Atom Feed",
		description: "The new home for RockmanDash Reviews",
		id: toSiteUrl("/", siteUrl),
		link: toSiteUrl("/", siteUrl),
		language: "en",
		image: toSiteUrl("/share-banner.png", siteUrl),
		favicon: toSiteUrl("/favicon.ico", siteUrl),
		copyright: `Contributor's rights reserved ${new Date().getFullYear()}, Reikaze Rambles`,
		feedLinks: {
			rss: toSiteUrl("/rss.xml", siteUrl),
			atom: toSiteUrl("/atom.xml", siteUrl),
			json: toSiteUrl("/feed.json", siteUrl),
		},
	});

	getPosts().forEach((post) => {
		const nodeUrl = toSiteUrl(`/posts/${post.slug}`, siteUrl);

		feed.addItem({
			title: post.title,
			id: nodeUrl,
			guid: nodeUrl,
			link: nodeUrl,
			description: post.description,
			content: post.excerpt,
			author: post.authors
				.map((id) => getPersonById(id))
				.map((author) => {
					return {
						name: author!.name,
						link: toSiteUrl(`/authors/${author!.id}`, siteUrl),
					};
				}),
			date: new Date(post.published),
			extensions: [],
		});
	});

	return new Response(feed.atom1());
};
