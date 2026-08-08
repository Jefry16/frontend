// Operator-authored source shown verbatim — a page's or policy's raw HTML body.
// Monospace and scroll-capped, never rendered as markup: the storefront renders
// it unescaped on purpose, so echoing it here as HTML would run the operator's
// own script in their admin session.
export const AppSourceBlock = ({ children }: { children: string }) => (
	<pre className="max-h-96 overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap break-words">
		{children}
	</pre>
);
