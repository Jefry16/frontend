import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		viteReact(),
	],
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		globals: false,
		css: false,
		// Pin the env the suite depends on so it never relies on a developer's
		// local .env (gitignored, absent in CI). The app's axios baseURL
		// (lib/api.ts) and the MSW handlers (test/handlers.ts) both read
		// VITE_API_URL — they must resolve to the same origin everywhere, or
		// requests miss the handlers and the suite fails only in CI.
		env: {
			VITE_API_URL: "http://localhost:8080/api",
			VITE_STOREFRONT_BASE_DOMAIN: "localhost:5173",
		},
	},
});
