import { CollectionInfo, PostInfo, RolesInfo, UnicornInfo } from "types/index";
import { people, posts, collections } from "./data";
import { isDefined } from "./is-defined";

function compareByDate(date1: string, date2: string): number {
	return new Date(date1) > new Date(date2) ? -1 : 1;
}

function compareByPublished<T extends { published: string }>(
	obj1: T,
	obj2: T,
): number {
	return compareByDate(obj1.published, obj2.published);
}

export function getAllPosts(): PostInfo[] {
	return [...posts];
}

export function getAllCollections(): CollectionInfo[] {
	return [...collections];
}

export function getPersonById(id: string): UnicornInfo | undefined {
	return people.find((person) => person.id === id);
}

export function getPeople(): UnicornInfo[] {
	return [...people].filter(isDefined);
}

export function getPostBySlug(slug: string): PostInfo | undefined {
	const post = posts.find((post) => post.slug === slug);
	return post;
}

export function getPosts(): PostInfo[] {
	return [...posts]
		.filter(isDefined)
		.filter((p) => !p.noindex)
		.sort(compareByPublished);
}

export function getPostsByCollection(collectionSlug: string): PostInfo[] {
	return [...posts]
		.filter((p) => p?.collection === collectionSlug)
		.filter((p) => !p.noindex)
		.sort((postA, postB) =>
			Number(postA.order) > Number(postB.order) ? 1 : -1,
		);
}

export function getPostsByPerson(personId: string): PostInfo[] {
	return [...posts]
		.filter(isDefined)
		.filter((p) => p.authors.includes(personId))
		.filter((p) => !p.noindex)
		.sort(compareByPublished);
}

export function getCollectionBySlug(slug: string): CollectionInfo | undefined {
	return collections.find((collection) => collection.slug === slug);
}

export function getCollections(): CollectionInfo[] {
	return [...collections].filter(isDefined).sort(compareByPublished);
}

export function getCollectionsByPerson(unicornId: string): CollectionInfo[] {
	return [...collections]
		.filter(isDefined)
		.filter((c) => c.authors.includes(unicornId))
		.sort(compareByPublished);
}
