import { buildMode, siteUrl } from "constants/site-config";
import { toSiteUrl } from "utils/base-path";

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
Sitemap: ${toSiteUrl("/sitemap-index.xml", siteUrl)}
				`.trim()
			: `
# *
User-agent: *
Disallow: /

# Host
Host: ${siteUrl}

# Sitemaps
Sitemap: ${toSiteUrl("/sitemap-index.xml", siteUrl)}
				`.trim();

	return new Response(body);
};
