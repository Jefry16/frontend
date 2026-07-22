import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

interface AppDetailFieldProps {
	label: string;
	children: ReactNode;
	/** Layout classes on the wrapper — e.g. `sm:col-span-2` for wide values. */
	className?: string;
}

// A labelled read-only fact: an uppercase muted label over its value. Used in
// the facts grids on detail/dashboard pages (inside a `<dl>`).
export function AppDetailField({
	label,
	children,
	className,
}: AppDetailFieldProps) {
	return (
		<div className={cn("flex flex-col gap-1", className)}>
			<span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				{label}
			</span>
			<div className="text-base font-medium">{children}</div>
		</div>
	);
}
