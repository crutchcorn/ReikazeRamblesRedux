import { UnicornInfo } from "../../types";

export interface SEOProps {
	description?: string;
	title: string;
	unicornsData?: UnicornInfo[];
	keywords?: string[];
	publishedTime?: string;
	editedTime?: string;
	type?: "article" | "profile" | "book";
	canonical?: string;
	isbn?: string;
	shareImage?: string;
	noindex?: boolean;
}
