import { type LucideIcon, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "#/components/ui/button";
import * as m from "#/paraglide/messages";
import { AppEmptyState } from "./AppEmptyState";

// A transient-failure state for a load that errored (network / 5xx) — a title,
// an optional detail, and a Retry. Distinct from AppNotFound: a 404 is a missing
// record (no retry); this is "try again". Pass `onRetry` (e.g. the query's
// refetch) to show the button.
export function AppError({
	title,
	description,
	icon = TriangleAlert,
	onRetry,
}: {
	title?: string;
	description?: string;
	icon?: LucideIcon;
	onRetry?: () => void;
}) {
	return (
		<AppEmptyState
			icon={icon}
			title={title ?? m.load_failed()}
			description={description}
			action={
				onRetry ? (
					<Button variant="outline" onClick={onRetry}>
						<RotateCw className="size-4" />
						{m.retry()}
					</Button>
				) : undefined
			}
		/>
	);
}
