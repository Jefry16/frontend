import { paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		paraglideVitePlugin({
			project: "./project.inlang",
			outdir: "./src/paraglide",
			strategy: ["cookie", "globalVariable", "preferredLanguage", "baseLocale"],
		}),
		devtools(),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		// SPA mode: the admin is client-only (auth-gated, no server functions), so
		// build a static shell + client bundle (prerendered index.html) — any
		// static host will serve it, and there is no SSR server to run.
		tanstackStart({
			spa: { enabled: true, prerender: { outputPath: "/index.html" } },
		}),
		viteReact(),
	],
});

export default config;
