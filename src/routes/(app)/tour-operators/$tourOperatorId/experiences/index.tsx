import { createFileRoute } from "@tanstack/react-router";
import { AppExperiencesList } from "#/experiences";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/",
)({
	component: ExperiencesPage,
});

// Experiences — the operator's sellable products. Table page → full width.
function ExperiencesPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.experiences()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.catalog() }, { label: m.experiences() }]}
					/>
				}
				actions={
					<AppNewLink
						to="/tour-operators/$tourOperatorId/experiences/new"
						params={{ tourOperatorId }}
					>
						{m.new_experience()}
					</AppNewLink>
				}
			/>
			<AppExperiencesList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
