import { createFileRoute } from "@tanstack/react-router";
import { AppExperiencesList } from "#/experiences";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/",
)({
	component: ExperiencesPage,
});

// Experiences — the operator's sellable products. Table page → full width.
function ExperiencesPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<div className="flex flex-col gap-6 p-6">
			<AppPageHeader
				title={m.experiences()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.catalog() }, { label: m.experiences() }]}
					/>
				}
			/>
			<AppExperiencesList tourOperatorId={tourOperatorId} />
		</div>
	);
}
