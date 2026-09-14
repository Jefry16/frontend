import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppPagesList } from "#/pages";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBreadcrumb, AppNewLink } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/pages/",
)({
	component: PagesPage,
});

function PagesPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();

	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.pages()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.content() }, { label: m.pages() }]}
					/>
				}
				actions={
					canWrite && (
						<AppNewLink
							to="/tour-operators/$tourOperatorId/content/pages/new"
							params={{ tourOperatorId }}
						>
							{m.new_page()}
						</AppNewLink>
					)
				}
			/>
			<AppPagesList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
