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
