import type { ReactNode } from "react";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";

export const AppFormActions = ({
	isPending,
	submitLabel,
	disabled,
	secondary,
}: {
	isPending: boolean;
	submitLabel: string;
	disabled?: boolean;
	secondary?: ReactNode;
}) => (
	<div className="flex justify-end gap-2">
		{secondary}
		<Button type="submit" disabled={isPending || disabled}>
			{isPending && <Spinner className="size-4" />}
			{submitLabel}
		</Button>
	</div>
);
