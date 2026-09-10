import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

interface AppDetailFieldProps {
	label: string;
	children: ReactNode;
	className?: string;
}

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
