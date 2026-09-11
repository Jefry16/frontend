import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const UI = "src/components/ui";

const pinned = {};
for (const path of [
	"components.json",
	...readdirSync(join(root, UI))
		.sort()
		.map((name) => `${UI}/${name}`),
]) {
	pinned[path] = createHash("sha256")
		.update(readFileSync(join(root, path)))
		.digest("hex");
}

writeFileSync(
	join(root, "src/shared/ui-vendor.json"),
	`${JSON.stringify(pinned, null, "\t")}\n`,
);
console.log(`pinned ${Object.keys(pinned).length} vendored files`);
