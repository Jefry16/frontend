// Never rendered as markup: this is operator-authored HTML, so echoing it would
// run their own script in their admin session.
//
// The scroll box holds only text, so nothing inside can take focus and reach the
// part below the fold (WCAG 2.1.1). The named <section> takes the tab stop and
// gives it an identity to announce.
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
