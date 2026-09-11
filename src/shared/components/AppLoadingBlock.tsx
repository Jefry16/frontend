import { Spinner } from "#/components/ui/spinner";
import { cn } from "#/lib/utils";

export const AppLoadingBlock = ({ className }: { className?: string }) => (
	<div className={cn("flex justify-center py-10", className)}>
		<Spinner />
	</div>
);
