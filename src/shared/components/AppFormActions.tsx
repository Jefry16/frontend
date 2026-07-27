import type { ReactNode } from "react";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";

// The form footer: a right-aligned primary submit with the pending spinner,
// plus an optional per-form secondary action rendered before it (a Cancel
// link, a Clear-translation button). `disabled` covers a sibling mutation's
// pending state (e.g. clearing) so submit can't race it. Full-width submits
// (auth, onboarding) are a different layout and don't use this.
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
