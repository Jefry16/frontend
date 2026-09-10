import axe, { type Result, type RunOptions } from "axe-core";
import { expect } from "vitest";

const JSDOM_BLIND: RunOptions = {
	rules: { "color-contrast": { enabled: false } },
};

const describeViolation = (v: Result) =>
	[
		`${v.id} (${v.impact ?? "unknown"}) — ${v.help}`,
		...v.nodes.map((n) => `    ${n.html}`),
		`    ${v.helpUrl}`,
	].join("\n");

export const expectNoA11yViolations = async (container: Element) => {
	const { violations } = await axe.run(container, JSDOM_BLIND);
	expect(
		violations.map(describeViolation).join("\n\n"),
		`${violations.length} accessibility violation(s)`,
	).toBe("");
};
