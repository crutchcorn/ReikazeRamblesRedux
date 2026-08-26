import path from "node:path";
import { isBasePath, toSiteUrl, withBasePath } from "./base-path";
import { resolvePath } from "./url-paths";

describe("withBasePath", () => {
	test.each(["", "/", "///"])("treats %j as an empty base path", (basePath) => {
		expect(withBasePath("/posts/example", basePath)).toBe("/posts/example");
	});

	test.each(["repo", "/repo", "repo/", "/repo/"])(
		"normalizes the %j base path",
		(basePath) => {
			expect(withBasePath("/posts/example", basePath)).toBe(
				"/repo/posts/example",
			);
		},
	);

	test("uses Vite's base path by default", () => {
		expect(withBasePath("/posts/example")).toBe("/posts/example");
	});

	test("maps the site root to the base path root", () => {
		expect(withBasePath("/", "/repo")).toBe("/repo/");
		expect(withBasePath("/?view=all#posts", "/repo/")).toBe(
			"/repo/?view=all#posts",
		);
	});

	test("preserves query strings and fragments", () => {
		expect(withBasePath("/posts/example?preview=1#summary", "/repo")).toBe(
			"/repo/posts/example?preview=1#summary",
		);
	});

	test.each([
		"/repo",
		"/repo/",
		"/repo/posts/example",
		"/repo?preview=1",
		"/repo#summary",
	])("does not prefix an already-prefixed path: %s", (value) => {
		expect(withBasePath(value, "/repo/")).toBe(value);
	});

	test("matches an existing base path at a segment boundary", () => {
		expect(withBasePath("/repository", "/repo")).toBe("/repo/repository");
	});

	test.each([
		"",
		"posts/example",
		"./posts/example",
		"../posts/example",
		"#summary",
		"?preview=1",
		"//cdn.example.com/image.png",
		"https://example.com/posts/example",
		"ftp://example.com/file.txt",
		"mailto:hello@example.com",
		"tel:+15555555555",
		"data:image/svg+xml;base64,PHN2Zz4=",
		"blob:https://example.com/id",
		"custom:value",
	])("leaves non-root-relative references unchanged: %s", (value) => {
		expect(withBasePath(value, "/repo")).toBe(value);
	});
});

describe("isBasePath", () => {
	test.each(["/repo", "/repo/", "/repo/?view=all", "/repo#top"])(
		"recognizes the configured base root: %s",
		(value) => {
			expect(isBasePath(value, "/repo/")).toBe(true);
		},
	);

	test.each(["/", "/repository", "/repo/posts/example"])(
		"rejects paths outside the configured base root: %s",
		(value) => {
			expect(isBasePath(value, "/repo")).toBe(false);
		},
	);

	test("recognizes the site root when no base path is configured", () => {
		expect(isBasePath("/", "/")).toBe(true);
	});
});

describe("toSiteUrl", () => {
	test("creates an absolute URL with the base path", () => {
		expect(
			toSiteUrl(
				"/posts/example?preview=1#summary",
				"https://example.com",
				"/repo/",
			),
		).toBe("https://example.com/repo/posts/example?preview=1#summary");
	});

	test("creates an absolute URL for the base path root", () => {
		expect(toSiteUrl("/", new URL("https://example.com"), "/repo")).toBe(
			"https://example.com/repo/",
		);
	});

	test.each([
		"https://external.example/path",
		"//cdn.example.com/image.png",
		"posts/example",
		"#summary",
		"?preview=1",
	])("leaves non-root-relative references unchanged: %s", (value) => {
		expect(toSiteUrl(value, "https://example.com", "/repo")).toBe(value);
	});
});

describe("resolvePath", () => {
	test("applies an explicit base path to public paths", () => {
		const resolved = resolvePath("/images/cover.png", "/unused", "/repo/");

		expect(resolved).toEqual({
			absoluteFSPath: path.join(process.cwd(), "public", "images", "cover.png"),
			relativePath: path.join("public", "images", "cover.png"),
			relativeServerPath: "/repo/images/cover.png",
		});
	});

	test("applies an explicit base path to relative content paths", () => {
		const relativeDir = path.join(process.cwd(), "content", "author");
		const resolved = resolvePath("./profile.png", relativeDir, "/repo");

		expect(resolved).toEqual({
			absoluteFSPath: path.join(relativeDir, "profile.png"),
			relativePath: path.join("content", "author", "profile.png"),
			relativeServerPath: "/repo/content/author/profile.png",
		});
	});

	test("does not resolve external URLs", () => {
		expect(
			resolvePath("https://example.com/image.png", "/unused", "/repo"),
		).toBeUndefined();
	});
});
