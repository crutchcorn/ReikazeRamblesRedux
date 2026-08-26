function getViteBasePath() {
	return import.meta.env?.BASE_URL ?? "/";
}

function normalizeBasePath(basePath: string) {
	const normalized = basePath.trim().replace(/^\/+|\/+$/g, "");
	return normalized ? `/${normalized}` : "";
}

/**
 * Prefixes a same-site, root-relative URL with the base path configured by
 * Astro/Vite. Other URL references retain their original meaning.
 *
 * Passing a base path is primarily useful for non-Vite consumers and tests.
 */
export function withBasePath(
	value: string,
	basePath: string = getViteBasePath(),
) {
	// Relative references, fragments, query strings, schemes, and
	// protocol-relative URLs should not be scoped to the site's base path.
	if (!value.startsWith("/") || value.startsWith("//")) return value;

	const base = normalizeBasePath(basePath);
	if (!base) return value;

	// Keep the operation idempotent without mistaking similarly named paths
	// (for example, `/repository`) for an existing `/repo` prefix.
	if (
		value === base ||
		value.startsWith(`${base}/`) ||
		value.startsWith(`${base}?`) ||
		value.startsWith(`${base}#`)
	) {
		return value;
	}

	return `${base}${value}`;
}

/** Returns whether a pathname points at the configured site root. */
export function isBasePath(
	value: string,
	basePath: string = getViteBasePath(),
) {
	const pathname = value.split(/[?#]/, 1)[0];
	const normalizedPathname =
		pathname.length > 1 ? pathname.replace(/\/+$/g, "") : pathname;
	const normalizedBase = normalizeBasePath(basePath) || "/";

	return normalizedPathname === normalizedBase;
}

/**
 * Converts a same-site, root-relative URL into an absolute URL while honoring
 * the configured base path. External and non-root-relative references are
 * returned unchanged.
 */
export function toSiteUrl(
	value: string,
	siteUrl: string | URL,
	basePath: string = getViteBasePath(),
) {
	const resolvedPath = withBasePath(value, basePath);
	if (!resolvedPath.startsWith("/") || resolvedPath.startsWith("//")) {
		return resolvedPath;
	}

	return new URL(resolvedPath, siteUrl).toString();
}
