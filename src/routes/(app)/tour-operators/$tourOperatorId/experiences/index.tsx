import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppExperiencesList } from "#/experiences";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNewLink } from "#/shared/components/AppNewLink";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/experiences/",
)({
	component: ExperiencesPage,
});

function ExperiencesPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();

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
					canWrite && (
						<AppNewLink
							to="/tour-operators/$tourOperatorId/experiences/new"
							params={{ tourOperatorId }}
						>
							{m.new_experience()}
						</AppNewLink>
					)
				}
			/>
			<AppExperiencesList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
