import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AppEmptyStateProps {
	icon?: LucideIcon;
	title: string;
	description?: string;
	// A node, so this shared component never imports a route or module.
	action?: ReactNode;
}

// For a genuinely empty list. Filtered-to-nothing shows AppDataTable's terse
// "No results" row instead.
export function AppEmptyState({
	icon: Icon,
	title,
	description,
	action,
}: AppEmptyStateProps) {
	return (
		<div className="flex flex-col items-center gap-3 text-center">
			{Icon && (
				<div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
					<Icon className="size-8" />
				</div>
			)}
			<div className="space-y-1">
				<h3 className="text-lg font-semibold">{title}</h3>
				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</div>
			{action}
		</div>
	);
}
