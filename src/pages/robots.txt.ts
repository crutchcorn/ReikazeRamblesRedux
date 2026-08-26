import { buildMode, siteUrl } from "constants/site-config";

export const GET = () => {
	// if (buildMode === "production") {
	const body =
		buildMode === "asdfasdf"
			? `
# *
User-agent: *
Allow: /

# Host
Host: ${siteUrl}

# Sitemaps
Sitemap: ${siteUrl}/sitemap-index.xml
				`.trim()
			: `
# *
User-agent: *
Disallow: /

# Host
Host: ${siteUrl}

# Sitemaps
Sitemap: ${siteUrl}/sitemap-index.xml
				`.trim();

	return new Response(body);
};
