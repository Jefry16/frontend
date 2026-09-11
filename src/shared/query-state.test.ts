import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const GATE =
	/if\s*\(([^)]*)\)\s*\{?\s*return\s*[(<]|\{\s*([^{}?]*?)\s*\?\s*\(?\s*</g;
const PENDING_RECEIVER = /\b([A-Za-z_$][\w$]*)\.(?:isPending|isLoading)\b/g;
const SPINNER = /<AppLoadingBlock\b/g;
const SPINNER_AS_SLOT = /loading=\{\s*<AppLoadingBlock\b/g;
const HAND_ROLLED_ERROR = /<AppError\b/;
const BUILDS_A_CARD_HEADER = /<CardHeader\b/;
const ERROR_TAG = /<AppError\b(?:(?!\/>)[\s\S])*\/>/g;

const count = (src: string, pattern: RegExp) =>
	[...src.matchAll(pattern)].length;

const unhandledPending = (src: string): string[] => {
	const found: string[] = [];
	for (const gate of src.matchAll(GATE)) {
		const condition = gate[1] ?? gate[2] ?? "";
		for (const [, receiver] of condition.matchAll(PENDING_RECEIVER)) {
			const name = receiver.replace(/[$]/g, "\\$&");
			const handled = new RegExp(`\\b${name}\\.(?:isError|error)\\b`);
			if (!handled.test(src)) found.push(receiver);
		}
	}
	return [...new Set(found)];
};

const strandedSpinner = (src: string) =>
	count(src, SPINNER) > count(src, SPINNER_AS_SLOT);

const handRolledCardError = (src: string) =>
	HAND_ROLLED_ERROR.test(src) && BUILDS_A_CARD_HEADER.test(src);

const errorWithoutReason = (src: string) =>
	[...src.matchAll(ERROR_TAG)].some((tag) => !/\bdescription=/.test(tag[0]));

const walk = (dir: string): string[] =>
	readdirSync(dir).flatMap((entry) => {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) return walk(path);
		return path.endsWith(".tsx") &&
			!path.includes(".stories.") &&
			!path.includes(".test.") &&
			!path.includes("/components/ui/") &&
			!path.includes("/paraglide/")
			? [path]
			: [];
	});

const sources = walk("src").map((path) => ({
	path: path.replace(/^src\//, ""),
	src: readFileSync(path, "utf8"),
}));

const offenders = (predicate: (src: string) => boolean) =>
	sources.filter(({ src }) => predicate(src)).map(({ path }) => path);

const ADVICE =
	"Render it through AppQueryState (query + loading + children), which shows the " +
	"reason and a retry and keeps the surrounding chrome in every state. There is no " +
	"allow-list here on purpose: if AppQueryState cannot express what this needs, widen " +
	"AppQueryState.";

describe("a query that can load can fail, and must say so", () => {
	it("the walk is wired (a broken walk must not pass vacuously)", () => {
		expect(sources.length).toBeGreaterThan(0);
	});

	it("no component branches on a query's pending without handling its failure", () => {
		const bad = sources
			.filter(({ src }) => unhandledPending(src).length > 0)
			.map(({ path, src }) => `${path} (${unhandledPending(src).join(", ")})`);

		expect(
			bad,
			`These render a loading state for a query whose failure they never handle, so a failed fetch spins forever. ${ADVICE}`,
		).toEqual([]);
	});

	it("a spinner appears only as the value of a loading prop", () => {
		expect(
			offenders(strandedSpinner),
			`AppLoadingBlock outside a loading prop is a spinner nothing can replace with an error. ${ADVICE}`,
		).toEqual([]);
	});

	it("a card does not hand-roll its own error state", () => {
		expect(
			offenders(handRolledCardError),
			`A hand-rolled error branch inside a card is how a failure loses the card's own heading. ${ADVICE}`,
		).toEqual([]);
	});

	it("every error says why, not just that", () => {
		expect(
			offenders(errorWithoutReason),
			"AppError without a description shows a generic failure. Pass description={apiErrorMessage(query.error)} so the operator learns what went wrong.",
		).toEqual([]);
	});
});

describe("the gate itself", () => {
	const BAD_PENDING = "if (locales.isPending) return <Spinner />;";
	const GOOD_PENDING =
		"if (locales.isError) return <AppError />; if (locales.isPending) return <Spinner />;";
	const MUTATION = "<AppFormActions isPending={save.isPending} />";

	it("catches a pending branch with no failure branch", () => {
		expect(unhandledPending(BAD_PENDING)).toEqual(["locales"]);
	});

	it("passes a pending branch whose receiver is also error-handled", () => {
		expect(unhandledPending(GOOD_PENDING)).toEqual([]);
	});

	it("ignores a mutation's pending, which is passed and never branched on", () => {
		expect(unhandledPending(MUTATION)).toEqual([]);
	});

	it("catches a spinner that is not a loading prop, and passes one that is", () => {
		expect(strandedSpinner("return <AppLoadingBlock />;")).toBe(true);
		expect(strandedSpinner("loading={<AppLoadingBlock />}")).toBe(false);
	});

	it("catches a card that hand-rolls its error, and an error with no reason", () => {
		expect(handRolledCardError("<CardHeader /> <AppError onRetry={r} />")).toBe(
			true,
		);
		expect(errorWithoutReason("<AppError onRetry={r} />")).toBe(true);
		expect(errorWithoutReason("<AppError description={why} />")).toBe(false);
	});

	it("reads the whole error tag, so attribute order and arrows do not matter", () => {
		expect(
			errorWithoutReason(
				"<AppError onRetry={() => refetch()} description={apiErrorMessage(e)} />",
			),
		).toBe(false);
	});

	it("treats isLoading as a pending branch too", () => {
		expect(
			unhandledPending("if (library.isLoading) return <Spinner />;"),
		).toEqual(["library"]);
	});

	it("does not let a dollar sign in a receiver name break the matcher", () => {
		expect(unhandledPending("if (q$.isPending) return <Spinner />;")).toEqual([
			"q$",
		]);
	});
});
