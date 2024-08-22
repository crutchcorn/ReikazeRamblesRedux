import {
	RawCollectionInfo,
	UnicornInfo,
	RawPostInfo,
	PostInfo,
	CollectionInfo,
	TagInfo,
	RawUnicornInfo,
} from "types/index";
import * as fs from "fs/promises";
import path, { join } from "path";
import { isNotJunk } from "junk";
import { getImageSize } from "../utils/get-image-size";
import { resolvePath } from "./url-paths";
import matter from "gray-matter";
import dayjs from "dayjs";

import { getExcerpt } from "./markdown/get-excerpt";

export const contentDirectory = join(process.cwd(), "content");

const tags = new Map<string, TagInfo>();

async function readUnicorn(unicornPath: string): Promise<UnicornInfo[]> {
	const unicornId = path.basename(unicornPath);

	const files = (await fs.readdir(unicornPath))
		.filter(isNotJunk)
		.filter((name) => name.startsWith("index.") && name.endsWith(".md"));

	const unicornObjects = [];

	for (const file of files) {
		const filePath = join(unicornPath, file);
		const fileContents = await fs.readFile(filePath, "utf-8");
		const frontmatter = matter(fileContents).data as RawUnicornInfo;

		const profileImgSize = await getImageSize(
			frontmatter.profileImg,
			unicornPath,
		);
		if (!profileImgSize || !profileImgSize.width || !profileImgSize.height) {
			throw new Error(`${unicornPath}: Unable to parse profile image size`);
		}

		const unicorn: UnicornInfo = {
			pronouns: "",
			color: "",
			roles: [],
			achievements: [],
			...frontmatter,
			kind: "unicorn",
			id: unicornId,
			file: filePath,
			totalPostCount: 0,
			totalWordCount: 0,
			profileImgMeta: {
				height: profileImgSize.height,
				width: profileImgSize.width,
				...resolvePath(frontmatter.profileImg, unicornPath)!,
			},
		};

		// normalize social links - if a URL or "@name" is entered, only preserve the last part
		const normalizeUsername = (username: string | undefined) =>
			username?.trim()?.replace(/^.*[/@](?!$)/, "");

		unicorn.socials.twitter = normalizeUsername(unicorn.socials.twitter);
		unicorn.socials.github = normalizeUsername(unicorn.socials.github);
		unicorn.socials.gitlab = normalizeUsername(unicorn.socials.gitlab);
		unicorn.socials.linkedIn = normalizeUsername(unicorn.socials.linkedIn);
		unicorn.socials.twitch = normalizeUsername(unicorn.socials.twitch);
		unicorn.socials.dribbble = normalizeUsername(unicorn.socials.dribbble);
		unicorn.socials.threads = normalizeUsername(unicorn.socials.threads);
		unicorn.socials.cohost = normalizeUsername(unicorn.socials.cohost);

		// "mastodon" should be a full URL; this will error if not valid
		try {
			if (unicorn.socials.mastodon)
				unicorn.socials.mastodon = new URL(unicorn.socials.mastodon).toString();
		} catch (e) {
			console.error(
				`'${unicorn.id}' socials.mastodon is not a valid URL: '${unicorn.socials.mastodon}'`,
			);
			throw e;
		}

		if (unicorn.socials.youtube) {
			// this can either be a "@username" or "channel/{id}" URL, which cannot be mixed.
			const username = normalizeUsername(unicorn.socials.youtube);
			unicorn.socials.youtube = unicorn.socials.youtube.includes("@")
				? `https://www.youtube.com/@${username}`
				: `https://www.youtube.com/channel/${username}`;
		}

		unicornObjects.push(unicorn);
	}

	return unicornObjects;
}

async function readCollection(
	collectionPath: string,
	fallbackInfo: {
		authors: string[];
	},
): Promise<CollectionInfo[]> {
	const slug = path.basename(collectionPath);

	const files = (await fs.readdir(collectionPath))
		.filter(isNotJunk)
		.filter((name) => name.startsWith("index.") && name.endsWith(".md"));

	const collectionObjects: CollectionInfo[] = [];
	for (const file of files) {
		const filePath = join(collectionPath, file);
		const fileContents = await fs.readFile(filePath, "utf-8");
		const frontmatter = matter(fileContents).data as RawCollectionInfo;

		const coverImgSize = await getImageSize(
			frontmatter.coverImg,
			collectionPath,
		);
		if (!coverImgSize || !coverImgSize.width || !coverImgSize.height) {
			throw new Error(`${collectionPath}: Unable to parse cover image size`);
		}

		const coverImgMeta = {
			height: coverImgSize.height,
			width: coverImgSize.width,
			...resolvePath(frontmatter.coverImg, collectionPath)!,
		};

		const frontmatterTags = (frontmatter.tags || []).filter((tag) => {
			if (tags.has(tag)) {
				return true;
			} else {
				console.warn(
					`${collectionPath}: Tag '${tag}' is not specified in content/data/tags.json! Filtering...`,
				);
				return false;
			}
		});

		// count the number of posts in the collection
		const postCount = (
			await fs.readdir(join(collectionPath, "posts")).catch((_) => [])
		).filter(isNotJunk).length;

		collectionObjects.push({
			...fallbackInfo,
			...frontmatter,
			kind: "collection",
			slug,
			file: filePath,
			postCount,
			tags: frontmatterTags,
			coverImgMeta,
		});
	}

	return collectionObjects;
}

async function readPost(
	postPath: string,
	fallbackInfo: {
		authors: string[];
		collection?: string;
	},
): Promise<PostInfo[]> {
	const slug = path.basename(postPath);
	const files = (await fs.readdir(postPath))
		.filter(isNotJunk)
		.filter((name) => name.startsWith("index.") && name.endsWith(".md"));

	const postObjects: PostInfo[] = [];
	for (const file of files) {
		const filePath = join(postPath, file);
		const fileContents = await fs.readFile(filePath, "utf-8");
		const fileMatter = matter(fileContents);
		const frontmatter = fileMatter.data as RawPostInfo;

		// Look... Okay? Just.. Look.
		// Yes, we could use rehypeRetext and then XYZW but jeez there's so many edgecases.

		/**
		 * An ode to words
		 *
		 * Oh words, what can be said of thee?
		 *
		 * Not much me.
		 *
		 * See, it's conceived that ye might have intriguing definitions from one-to-another
		 *
		 * This is to say: "What is a word?"
		 *
		 * An existential question at best, a sisyphean effort at worst.
		 *
		 * See, while `forms` and `angular` might be considered one word each: what of `@angular/forms`? Is that 2?
		 *
		 * Or, what of `@someone mentioned Angular's forms`? Is that 4?
		 *
		 * This is a long-winded way of saying "We know our word counter is inaccurate, but so is yours."
		 *
		 * Please do let us know if you have strong thoughts/answers on the topic,
		 * we're happy to hear them.
		 */
		const wordCount = fileMatter.content.split(/\s+/).length;

		// get an excerpt of the post markdown no longer than 150 chars
		const excerpt = getExcerpt(fileMatter.content, 150);

		postObjects.push({
			...fallbackInfo,
			...frontmatter,
			kind: "post",
			slug,
			file: filePath,
			path: path.relative(contentDirectory, postPath),
			tags: frontmatter.tags ?? [],
			wordCount: wordCount,
			description: frontmatter.description || excerpt,
			excerpt,
			publishedMeta:
				frontmatter.published &&
				dayjs(frontmatter.published).format("MMMM D, YYYY"),
			editedMeta:
				frontmatter.edited && dayjs(frontmatter.edited).format("MMMM D, YYYY"),
			socialImg: `/generated/${slug}.twitter-preview.jpg`,
		});
	}

	return postObjects;
}

const people: UnicornInfo[] = [];
for (const unicornId of await fs.readdir(contentDirectory)) {
	if (!isNotJunk(unicornId)) continue;
	const unicornPath = join(contentDirectory, unicornId);
	people.push(...(await readUnicorn(unicornPath)));
}

const collections: CollectionInfo[] = [];
for (const person of [...people]) {
	const collectionsDirectory = join(contentDirectory, person.id, "collections");

	const slugs = (
		await fs.readdir(collectionsDirectory).catch((_) => [])
	).filter(isNotJunk);

	for (const slug of slugs) {
		const collectionPath = join(collectionsDirectory, slug);
		collections.push(
			...(await readCollection(collectionPath, {
				authors: [person.id],
			})),
		);
	}
}

const posts: PostInfo[] = [];
for (const collection of [...collections]) {
	const postsDirectory = join(
		contentDirectory,
		collection.authors[0],
		"collections",
		collection.slug,
		"posts",
	);

	const slugs = (await fs.readdir(postsDirectory).catch((_) => [])).filter(
		isNotJunk,
	);

	for (const slug of slugs) {
		const postPath = join(postsDirectory, slug);
		posts.push(
			...(await readPost(postPath, {
				authors: collection.authors,
				collection: collection.slug,
			})),
		);
	}
}
for (const person of [...people]) {
	const postsDirectory = join(contentDirectory, person.id, "posts");

	const slugs = (await fs.readdir(postsDirectory).catch((_) => [])).filter(
		isNotJunk,
	);

	for (const slug of slugs) {
		const postPath = join(postsDirectory, slug);
		posts.push(
			...(await readPost(postPath, {
				authors: [person.id],
			})),
		);
	}
}

{
	// sort posts by date in descending order
	const sortedPosts = [...posts].sort((post1, post2) => {
		const date1 = new Date(post1.published);
		const date2 = new Date(post2.published);
		return date1 > date2 ? -1 : 1;
	});

	// calculate whether each post should have a banner image
	for (let i = 0; i < sortedPosts.length; i++) {
		const post = sortedPosts[i];
		// index of the post on its page (assuming the page is paginated by 8)
		const pageIndex = i % 8;
		// if the post is at index 0 or 4, it should have a banner
		if (pageIndex === 0 || pageIndex === 4) {
			post.bannerImg = `/generated/${post.slug}.banner.jpg`;
		}
	}
}

{
	// sum the totalWordCount and totalPostCount for each unicorn object
	for (const post of [...posts]) {
		for (const authorId of post.authors) {
			const unicorn = people.find((person) => person.id === authorId);
			if (!unicorn) continue;
			unicorn.totalPostCount += 1;
			unicorn.totalWordCount += post.wordCount;
		}
	}
}

export { people, collections, posts, tags };
