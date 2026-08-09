import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

interface AppDetailFieldProps {
	label: string;
	children: ReactNode;
	/** Layout classes on the wrapper — e.g. `sm:col-span-2` for wide values. */
	className?: string;
}

// **Must sit inside a `<dl>`.** It renders the `<dt>`/`<dd>` pair, which is what
// makes a screen reader announce "Handle, /pages/about" instead of two unrelated
// runs of text. Preflight zeroes the `<dd>` indent, so it costs nothing visually.
export function AppDetailField({
	label,
	children,
	className,
}: AppDetailFieldProps) {
	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				{label}
			</dt>
			<dd className="text-base font-medium">{children}</dd>
		</div>
	);
}
