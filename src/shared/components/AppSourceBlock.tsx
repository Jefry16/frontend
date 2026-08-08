// Operator-authored source shown verbatim — a page's or policy's raw HTML body.
// Monospace and scroll-capped, never rendered as markup: the storefront renders
// it unescaped on purpose, so echoing it here as HTML would run the operator's
// own script in their admin session.
//
// The scroll box holds only text, so there is nothing inside for a keyboard to
// land on and reach the part below the fold (WCAG 2.1.1). A named <section>
// takes the tab stop and gives it an identity — a screen reader announces
// "Page body, region" rather than an unexplained focus ring.
export const AppSourceBlock = ({
	label,
	children,
}: {
	label: string;
	children: string;
}) => (
	<section
		// biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be keyboard-reachable
		tabIndex={0}
		aria-label={label}
		className="max-h-96 overflow-auto rounded-md border bg-muted/40"
	>
		<pre className="p-3 font-mono text-xs whitespace-pre-wrap break-words">
			{children}
		</pre>
	</section>
);
