import { type LucideIcon, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "#/components/ui/button";
import * as m from "#/paraglide/messages";
import { AppEmptyState } from "./AppEmptyState";

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
