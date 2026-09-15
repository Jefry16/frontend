import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppExperienceForm } from "#/experiences";
import * as m from "#/paraglide/messages";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/new",
)({
	component: NewExperiencePage,
});

function NewExperiencePage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppPageHeader
					title={m.new_experience()}
					breadcrumb={
						<AppBreadcrumb
							items={[
								{ label: m.catalog() },
								{
									label: m.experiences(),
									to: "/tour-operators/$tourOperatorId/experiences",
									params: { tourOperatorId },
								},
								{ label: m.new_experience() },
							]}
						/>
					}
				/>
				<AppExperienceForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
