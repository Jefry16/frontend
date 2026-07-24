import { createFileRoute } from "@tanstack/react-router";
import { AppExperienceForm } from "#/experiences";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/new",
)({
	component: NewExperiencePage,
});

// Single-resource page → centered at max-w-3xl. Static "new" wins over the
// dynamic $experienceId sibling.
function NewExperiencePage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
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
		</div>
	);
}
