import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

interface AppDetailFieldProps {
	label: string;
	children: ReactNode;
	/** Layout classes on the wrapper — e.g. `sm:col-span-2` for wide values. */
	className?: string;
}

// A labelled read-only fact: an uppercase muted label over its value.
//
// **Must sit inside a `<dl>`.** It renders the `<div>`-wrapped `<dt>`/`<dd>`
// pair a description list is made of, which is what makes a screen reader
// announce "Handle, /pages/about" rather than two unrelated runs of text. A
// `<dl>` whose children are plain divs — which this used to render — claims
// that structure without delivering it. Tailwind's preflight zeroes the `<dd>`
// indent, so the pair costs nothing visually.
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
