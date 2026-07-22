import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AppEmptyStateProps {
	icon?: LucideIcon;
	title: string;
	description?: string;
	// The call-to-action, passed as a node (e.g. the "New X" button) so this
	// shared component never imports a route/module. Omitted → header only.
	action?: ReactNode;
}

// First-run / empty state: icon + copy + an optional CTA, centered. Shown for a
// genuinely empty resource list; a filtered-to-nothing list shows the terse
// "No results" row instead (see AppDataTable).
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
