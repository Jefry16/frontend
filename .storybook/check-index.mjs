/**
 * Fails when the built Storybook indexed fewer story files than exist on disk.
 *
 * `build-storybook` exits 0 on a `stories` glob that matches nothing — it builds
 * an empty Storybook and says so only in a warning. Nothing else notices:
 * `story-coverage` checks files on disk, `story-render` uses its own glob, and
 * neither reads `main.ts`. So the whole inventory could silently stop being
 * indexed while every gate stayed green. This is the assertion that ties the
 * built artifact back to the source tree.
 *
 * Run after `pnpm build-storybook` — it reads that build's output.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const INDEX = join(root, "storybook-static", "index.json");
const SRC = join(root, "src");

const die = (message) => {
	console.error(`\n  ${message}\n`);
	process.exit(1);
};

const storyFiles = (dir) => {
	const found = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...storyFiles(path));
		else if (entry.name.endsWith(".stories.tsx")) found.push(path);
	}
	return found;
};

let index;
try {
	index = JSON.parse(readFileSync(INDEX, "utf8"));
} catch {
	die(`No ${relative(root, INDEX)}. Run \`pnpm build-storybook\` first.`);
}

const entries = Object.values(index.entries ?? {});
// `importPath` is Storybook's own record of which file each story came from,
// so comparing the set of them to the tree is exact — no counting stories.
const indexed = new Set(
	entries.map((e) => resolve(root, e.importPath.replace(/^\.\//, ""))),
);
const onDisk = storyFiles(SRC);
const missing = onDisk.filter((f) => !indexed.has(f));

if (missing.length > 0) {
	console.error(
		`\n  Storybook indexed ${indexed.size} of ${onDisk.length} story files.`,
	);
	console.error("  Not indexed — check the `stories` globs in main.ts:\n");
	for (const f of missing.slice(0, 10)) {
		console.error(`    ${relative(root, f)}`);
	}
	if (missing.length > 10) console.error(`    …and ${missing.length - 10} more`);
	console.error();
	process.exit(1);
}

console.log(
	`  Storybook indexed all ${onDisk.length} story files (${entries.length} stories).`,
);
