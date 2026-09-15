import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { openingTagProps, propExpression } from "#/test/jsx";

const ROOT = process.cwd();
const walk = (dir: string, out: string[] = []): string[] => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		if (entry.isDirectory()) walk(full, out);
		else if (/\.tsx$/.test(entry.name) && !/\.test\.tsx$/.test(entry.name))
			out.push(full);
	}
	return out;
};

const components = new Map<string, string>();
for (const f of walk(join(ROOT, "src")).filter(
	(f) => !f.includes("/routes/"),
)) {
	const source = readFileSync(f, "utf8");
	for (const [, name] of source.matchAll(/^export const (App[A-Za-z]+)/gm))
		components.set(name, source);
}

/** The route's source plus every App component it reaches, however deep. */
const closure = (source: string): string[] => {
	const seen = new Set<string>();
	const texts = [source];
	const queue = [source];
	while (queue.length) {
		const text = queue.pop() as string;
		for (const [, name] of text.matchAll(/<(App[A-Za-z]+)/g)) {
			if (seen.has(name)) continue;
			seen.add(name);
			const next = components.get(name);
			if (next) {
				texts.push(next);
				queue.push(next);
			}
		}
	}
	return texts;
};

/**
 * A settings page is a form-shaped page built from settings cards. A
 * translations page that carries a metafields card is still a translations
 * page, and the translations gate owns it.
 */
const pages = walk(join(ROOT, "src", "routes"))
	.map((f) => ({ file: relative(ROOT, f), source: readFileSync(f, "utf8") }))
	.filter(({ source }) => /variant="form"/.test(source))
	.map((route) => ({ ...route, texts: closure(route.source) }))
	.filter(
		({ texts }) =>
			texts.some((text) => /<AppSettingsCard\b/.test(text)) &&
			!texts.some((text) => /<AppLocaleTabs\b/.test(text)),
	);

const tags = (texts: string[], tag: string) =>
	texts.flatMap((text) => openingTagProps(text, tag));

describe("every settings page is a stack of self-describing cards a viewer can read", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(pages.length).toBeGreaterThan(2);
		expect(components.size).toBeGreaterThan(50);
	});

	it("no write gate: a viewer opens the page and reads each card", () => {
		const offenders = pages
			.filter(({ texts }) => texts.some((text) => /<AppWriteGate\b/.test(text)))
			.map(({ file }) => file);
		expect(
			offenders,
			"A settings page is open to a viewer: each card shows its summary " +
				"to them and its form to an editor. Never wrap the page in " +
				"AppWriteGate; branch on canWrite inside the card.",
		).toEqual([]);
	});

	it("one header, with a breadcrumb", () => {
		const offenders = pages
			.filter(({ texts }) => {
				const headers = tags(texts, "AppPageHeader");
				return headers.length !== 1 || !/\bbreadcrumb=/.test(headers[0]);
			})
			.map(({ file }) => file);
		expect(
			offenders,
			"Exactly one AppPageHeader reachable from the route, carrying a " +
				"breadcrumb back to the settings hub.",
		).toEqual([]);
	});

	it("every card is a settings card, none is hand-rolled", () => {
		const offenders = pages
			.filter(({ texts }) =>
				texts.some((text) =>
					/<Card(Header|Title|Description|Content|Footer)?[\s>]/.test(text),
				),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"A card on a settings page is AppSettingsCard, with a title and a " +
				"description, so every card names itself the same way. Never " +
				"compose Card, CardHeader or CardContent by hand here.",
		).toEqual([]);
	});

	it("every form is AppForm, none is a raw <form>", () => {
		const offenders = pages
			.filter(({ texts }) => texts.some((text) => /<form[\s>]/.test(text)))
			.map(({ file }) => file);
		expect(
			offenders,
			"A card's form is AppForm: it prevents the default submit, shows the " +
				"server error above the fields and takes its actions as a prop. " +
				"A raw <form> writes those three by hand.",
		).toEqual([]);
	});

	it("a card loads as a form skeleton without a second card, or stays hidden", () => {
		const offenders = pages
			.filter(({ texts }) =>
				tags(texts, "AppQueryState").some((state) => {
					const loading = propExpression(state, "loading");
					return (
						loading !== "null" &&
						!/^<AppFormSkeleton\b[^>]*\bcard=\{false\}/.test(loading ?? "")
					);
				}),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"Inside a settings card a query loads as " +
				"<AppFormSkeleton rows={n} card={false} />: the card already draws " +
				"the frame. loading={null} is the one alternative, for a card whose " +
				"chrome hides it until its query settles.",
		).toEqual([]);
	});

	it("nothing beside the submit button", () => {
		const offenders = pages
			.filter(({ texts }) =>
				tags(texts, "AppFormActions").some(
					(actions) => propExpression(actions, "secondary") !== undefined,
				),
			)
			.map(({ file }) => file);
		expect(
			offenders,
			"A settings card saves itself; there is nothing to cancel and " +
				"nowhere else to go. Pass no secondary to AppFormActions.",
		).toEqual([]);
	});
});
