import { createFileRoute } from "@tanstack/react-router";
import { AppExperienceForm } from "#/experiences";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppWriteGate } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/new",
)({
	component: NewExperiencePage,
});

// Static "new" wins over the dynamic $experienceId sibling.
function NewExperiencePage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
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
			<AppWriteGate>
				<AppExperienceForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
