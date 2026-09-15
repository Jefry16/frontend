import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const walk = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full, out);
		else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
			out.push(full);
	}
	return out;
};

const html = readFileSync(join(ROOT, "index.html"), "utf8");
const entry = readFileSync(join(ROOT, "src", "main.tsx"), "utf8");
const settings = JSON.parse(
	readFileSync(join(ROOT, "project.inlang", "settings.json"), "utf8"),
) as { baseLocale: string };

const writesDocumentLanguage = /document\.documentElement\.lang\s*=/;

describe("the document says which language it is in", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(html).toMatch(/<html\b/);
		expect(settings.baseLocale).toBeTruthy();
	});

	it("the served markup carries the base locale", () => {
		expect(
			html.match(/<html lang="([^"]*)"/)?.[1],
			"index.html is served before any script runs, so its lang is the " +
				"one locale the app can promise without knowing the reader: the " +
				"base locale from project.inlang/settings.json. Adding a language " +
				"never changes it; changing the base one does.",
		).toBe(settings.baseLocale);
	});

	it("the entry corrects it to the locale the reader gets", () => {
		expect(
			writesDocumentLanguage.test(entry),
			'A Spanish UI served as lang="en" tells a screen reader to ' +
				"pronounce Spanish as English and a browser to offer a " +
				"translation of text already in the reader's language. " +
				"src/main.tsx assigns document.documentElement.lang from " +
				"getLocale(); setLocale reloads the page, so once is enough.",
		).toBe(true);
	});

	it("nothing else writes it", () => {
		const offenders = walk(join(ROOT, "src"))
			.filter((f) => !f.endsWith("main.tsx"))
			.filter((f) => writesDocumentLanguage.test(readFileSync(f, "utf8")))
			.map((f) => relative(ROOT, f));
		expect(
			offenders,
			"The document's language is decided once, at the entry, from the " +
				"locale the runtime resolved. A second writer is a second answer.",
		).toEqual([]);
	});
});
