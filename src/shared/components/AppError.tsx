import { type LucideIcon, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "#/components/ui/button";
import { useUiLabels } from "../labels";
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
	const labels = useUiLabels();
	return (
		<AppEmptyState
			icon={icon}
			title={title ?? labels.loadFailed}
			description={description}
			action={
				onRetry ? (
					<Button variant="outline" onClick={onRetry}>
						<RotateCw className="size-4" />
						{labels.retry}
					</Button>
				) : undefined
			}
		/>
	);
}
