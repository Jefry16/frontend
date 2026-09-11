import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import pinned from "./ui-vendor.json";

const ROOT = process.cwd();
const UI = "src/components/ui";
const PINNED: Record<string, string> = pinned;

const sha256 = (path: string) =>
	createHash("sha256")
		.update(readFileSync(join(ROOT, path)))
		.digest("hex");

const onDisk: Record<string, string> = Object.fromEntries(
	[
		"components.json",
		...readdirSync(join(ROOT, UI))
			.sort()
			.map((name) => `${UI}/${name}`),
	].map((path) => [path, sha256(path)]),
);

const VENDORED =
	`${UI} is vendored from shadcn and is never edited by hand. To change how a ` +
	"component looks, change a token in src/styles.css or wrap it in src/shared. " +
	"To add one: pnpm dlx shadcn@latest add <name>, then pnpm pin-ui. To upgrade " +
	"one: the same command, then pnpm pin-ui, in a PR that says so.";

describe("ui vendor pin", () => {
	it("the directory walk is wired (a broken walk must not pass vacuously)", () => {
		expect(Object.keys(onDisk).length).toBeGreaterThan(1);
	});

	it("no vendored file differs from its pin", () => {
		const edited = Object.keys(onDisk).filter(
			(path) => path in PINNED && PINNED[path] !== onDisk[path],
		);
		expect(edited, VENDORED).toEqual([]);
	});

	it("every vendored file is pinned and every pin still has a file", () => {
		const unpinned = Object.keys(onDisk).filter((path) => !(path in PINNED));
		const gone = Object.keys(PINNED).filter((path) => !(path in onDisk));
		expect(
			{ unpinned, gone },
			`${VENDORED} A file was added or removed without pnpm pin-ui.`,
		).toEqual({ unpinned: [], gone: [] });
	});
});
