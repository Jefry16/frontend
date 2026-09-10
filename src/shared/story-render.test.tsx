import {
	composeStories,
	setProjectAnnotations,
} from "@storybook/tanstack-react";
import * as frameworkPreview from "@storybook/tanstack-react/preview";
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as preview from "../../.storybook/preview";

setProjectAnnotations([
	(frameworkPreview as { default?: object }).default ?? frameworkPreview,
	preview.default,
]);

const ERROR_UI = "Story did something wrong";

const modules = import.meta.glob("/src/**/*.stories.tsx", { eager: true });

describe.each(Object.entries(modules))("%s", (_path, mod) => {
	const composed = composeStories(mod as never) as Record<
		string,
		React.ComponentType
	>;

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
