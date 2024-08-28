export interface RawPostInfo {
	title: string;
	published: string;
	authors?: string[];
	tags?: string[];
	license?: string;
	description?: string;
	edited?: string;
	collection?: string;
	order?: number;
	originalLink?: string;
	noindex?: boolean;
}

export interface PostInfo extends RawPostInfo {
	kind: "post";
	slug: string;
	file: string;
	authors: string[];
	tags: string[];
	description: string;
	excerpt: string;
	path: string;
	publishedMeta: string;
	editedMeta?: string;
	socialImg: string;
	wordCount: number;
}

export interface PostHeadingInfo {
	// Title value
	value: string;
	// ID
	slug: string;
	depth: number;
}
