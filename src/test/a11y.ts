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
 * Assert a rendered tree has no axe violations.
 *
 * **A floor, not a substitute.** Measured against the five findings the hand
 * rounds turned up, axe catches one of them here:
 *
 * - `<dl>` of plain divs — CAUGHT (`definition-list`, serious).
 * - unreachable scroll region — MISSED. jsdom paints nothing, so
 *   `scrollHeight` and `clientHeight` are both 0 and axe marks
 *   `scrollable-region-focusable` *inapplicable*. A real browser would catch it.
 * - missing `aria-sort`, missing `aria-current`, and 47 buttons all named
 *   "Filter" — NOT AXE RULES. None is a violation; they are announcement gaps
 *   axe has no opinion about.
 *
 * So this suite covers the structural half — roles, labels, list semantics,
 * duplicate ids, form associations — and the targeted tests next to it
 * (`AppDataTable.test.tsx`, `SidebarNavLeaf.test.tsx`) cover the half about
 * whether state is announced. Both halves are needed; neither is the whole.
 */
export const expectNoA11yViolations = async (container: Element) => {
	const { violations } = await axe.run(container, JSDOM_BLIND);
	expect(
		violations.map(describeViolation).join("\n\n"),
		`${violations.length} accessibility violation(s)`,
	).toBe("");
};
