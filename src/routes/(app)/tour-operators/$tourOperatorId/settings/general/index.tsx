import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppOperatorLogoCard, useCurrentTourOperator } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/general/",
)({
	component: GeneralSettingsPage,
});

// General operator settings. Today it holds the operator logo; more general
// settings join here as they land. Single-resource page → centered at max-w-3xl.
function GeneralSettingsPage() {
	const operator = useCurrentTourOperator();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<AppPageHeader title={m.general()} />
			{operator && (
				<AppOperatorLogoCard
					tourOperatorId={operator.id}
					logoUrl={operator.logoUrl}
				/>
			)}
		</div>
	);
}
