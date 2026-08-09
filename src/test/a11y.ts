import axe, { type Result, type RunOptions } from "axe-core";
import { expect } from "vitest";

// jsdom paints nothing, so any rule that needs real layout cannot run here and
// reports noise rather than findings. Contrast is the big one — it belongs in a
// real browser, against the token palette, not in a unit test.
const JSDOM_BLIND: RunOptions = {
	rules: { "color-contrast": { enabled: false } },
};

const describeViolation = (v: Result) =>
	[
		`${v.id} (${v.impact ?? "unknown"}) — ${v.help}`,
		...v.nodes.map((n) => `    ${n.html}`),
		`    ${v.helpUrl}`,
	].join("\n");

/**
 * A floor, not a substitute: measured against five hand-found issues, this
 * caught one. It covers structure — roles, labels, list semantics, duplicate
 * ids, form associations — and is blind to whether *state* is announced
 * (`aria-sort`, `aria-current`, same-named buttons are not axe rules at all).
 * The targeted tests beside it cover that half.
 */
export const expectNoA11yViolations = async (container: Element) => {
	const { violations } = await axe.run(container, JSDOM_BLIND);
	expect(
		violations.map(describeViolation).join("\n\n"),
		`${violations.length} accessibility violation(s)`,
	).toBe("");
};
