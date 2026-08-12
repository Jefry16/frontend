import {
	composeStories,
	setProjectAnnotations,
} from "@storybook/tanstack-react";
import * as frameworkPreview from "@storybook/tanstack-react/preview";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as preview from "../../.storybook/preview";

// `story-coverage.test.ts` asserts a story FILE exists — it reads glob keys and
// imports nothing, so a story that throws the moment it mounts has always passed
// it. This one mounts them: every story in the repo renders with the real
// decorators and has to paint the component rather than an error.
//
// Four details are load-bearing, each of them found by watching this fail:
//
//   - Annotations go at MODULE scope, not in `beforeAll`. `composeStories` runs
//     while the describes are collected, before any hook fires; from a hook the
//     first-collected stories compose without a router and 111 of 274 die on a
//     null router context.
//   - The framework's own preview supplies that memory router. The repo's
//     `.storybook/preview` only carries the providers.
//   - The router mounts asynchronously, so the first synchronous render is empty
//     for ALL of them. Asserting without the `waitFor` passes 274/274 against
//     blank containers.
//   - A throw inside a story does NOT fail the render. The framework catches it
//     and paints its own error node, which is why "did it paint" is not enough
//     on its own — see ERROR_UI.
setProjectAnnotations([
	(frameworkPreview as { default?: object }).default ?? frameworkPreview,
	preview.default,
]);

// `@storybook/tanstack-react`'s error boundary:
//   React.createElement("div", null, "Story did something wrong : ", String(error))
// Without this check a component that throws still counts as rendered, because
// the boundary's own output is DOM.
const ERROR_UI = "Story did something wrong";

const modules = import.meta.glob("/src/**/*.stories.tsx", { eager: true });

describe.each(Object.entries(modules))("%s", (_path, mod) => {
	const composed = composeStories(mod as never) as Record<
		string,
		React.ComponentType
	>;

	// `baseElement` (the body), not the container: a dialog portals out of the
	// container and looks empty there. An empty render leaves the body holding
	// the bare container div and nothing else, so a count above 1 means the story
	// painted — a component returning null scores 0 inside it.
	it.each(Object.keys(composed))("%s renders", async (name) => {
		const Story = composed[name];
		const { baseElement, unmount } = render(<Story />);

		await waitFor(() =>
			expect(baseElement.querySelectorAll("*").length).toBeGreaterThan(1),
		);
		expect(baseElement.textContent ?? "").not.toContain(ERROR_UI);

		unmount();
	});
});
