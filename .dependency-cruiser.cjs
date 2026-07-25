/**
 * dependency-cruiser config — enforces module boundaries.
 *
 * Rules in plain English:
 *   1. No circular imports.
 *   2. A module may only import another module via that module's index.ts barrel.
 *      Cross-module deep imports (e.g. `#/auth/components/Foo` from outside `auth/`) are forbidden.
 *   3. Non-module importers (routes / lib / hooks) may import a module only via its barrel —
 *      `#/<module>`, never `#/<module>/internals`.
 *   4. shared/ and components/ui/ must not depend on any business module at all.
 *
 * `MODULES` lists the top-level domain folder names — it must stay in sync with the actual
 * `src/<module>/` folders. Add a new module here when one is created, or its boundaries go
 * unenforced. Greenfield rebuild: no feature modules exist yet — they are added here as each
 * is built (auth first). While the list is empty, the module-scoped rules match nothing.
 */

const MODULES = [
	"audiences",
	"pickup-locations",
	"auth",
	"reference",
	"tour-operator",
	"team",
	"media",
	"experiences",
];
// A never-matching group while MODULES is empty, so the module-scoped rules below
// are inert until the first feature module is added.
const MODULE_GROUP = MODULES.length ? `(${MODULES.join("|")})` : "(?!x)x";

module.exports = {
	forbidden: [
		{
			name: "no-circular",
			severity: "error",
			comment: "No cycles. Break them up.",
			from: {},
			to: { circular: true },
		},
		{
			name: "no-orphans",
			severity: "info",
			comment: "Orphan modules — imported by nothing. Likely dead code.",
			from: {
				orphan: true,
				pathNot: [
					"^src/routeTree\\.gen\\.ts$",
					"^src/router\\.tsx$",
					"^src/routes/", // Tanstack discovers these by filesystem
					"^src/styles\\.css$",
					"\\.d\\.ts$",
					"^src/paraglide/",
				],
			},
			to: {},
		},
		{
			name: "no-cross-module-deep-imports",
			severity: "error",
			comment:
				"Cross-module imports must go through the module's barrel (src/<module>/index.ts). " +
				"Use `#/<module>` instead of `#/<module>/components/...`.",
			from: {
				path: `^src/${MODULE_GROUP}/`,
			},
			to: {
				path: `^src/${MODULE_GROUP}/`,
				// when from-module === to-module, allow anything (intra-module is free)
				// when from-module !== to-module, only allow `<module>/index.{ts,tsx}`
				pathNot: [
					// allow imports of any module's barrel
					`^src/${MODULE_GROUP}/index\\.(ts|tsx)$`,
					// allow intra-module via $1 backreference (same module)
					"^src/$1/",
				],
			},
		},
		{
			name: "no-deep-import-into-modules",
			severity: "error",
			comment:
				"Importers outside any module (routes / lib / hooks) must reach a module through its " +
				"barrel (src/<module>/index.ts). Use `#/<module>`, not `#/<module>/components/...` " +
				"or `#/<module>/types`.",
			from: {
				path: "^src/(routes|lib|hooks)/",
			},
			to: {
				path: `^src/${MODULE_GROUP}/`,
				pathNot: [`^src/${MODULE_GROUP}/index\\.(ts|tsx)$`],
			},
		},
		{
			name: "shared-cant-import-modules",
			severity: "error",
			comment:
				"shared/ must not depend on any business module. Move the dependency the other direction.",
			from: { path: "^src/shared/" },
			to: { path: `^src/${MODULE_GROUP}/` },
		},
		{
			name: "ui-cant-import-modules",
			severity: "error",
			comment:
				"components/ui/ (shadcn primitives) must not depend on business modules.",
			from: { path: "^src/components/ui/" },
			to: { path: `^src/${MODULE_GROUP}/` },
		},
	],
	options: {
		doNotFollow: { path: ["node_modules"] },
		tsConfig: { fileName: "tsconfig.json" },
		// Count `import type` as a real dependency. Without this, files whose
		// only consumers use type-only imports (every `types.ts`) show up as
		// false-positive orphans and the cycle/import graph is incomplete.
		tsPreCompilationDeps: true,
		enhancedResolveOptions: {
			exportsFields: ["exports"],
			conditionNames: ["import", "require", "node", "default", "types"],
			extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts"],
		},
		includeOnly: "^src/",
		exclude: {
			path: [
				"^src/paraglide/",
				"^src/routeTree\\.gen\\.ts$",
				"\\.test\\.(ts|tsx)$",
				// Dev-only, same rationale as tests: the /_dev gallery and colocated
				// stories import components across the tree; they never ship to prod.
				"\\.stories\\.(tsx?)$",
				"^src/dev/",
			],
		},
		reporterOptions: {
			text: { highlightFocused: true },
		},
	},
};
