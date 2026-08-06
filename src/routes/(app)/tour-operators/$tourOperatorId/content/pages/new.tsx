import { createFileRoute } from "@tanstack/react-router";
import { AppPageForm } from "#/pages";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppNotPermitted } from "#/shared/components/AppNotPermitted";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { usePermissions } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/pages/new",
)({
	component: NewPagePage,
});

// Static "new" wins over the dynamic $pageId sibling.
function NewPagePage() {
	const { canWrite } = usePermissions();
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.new_page()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.content() },
							{
								label: m.pages(),
								to: "/tour-operators/$tourOperatorId/content/pages",
								params: { tourOperatorId },
							},
							{ label: m.new_page() },
						]}
					/>
				}
			/>
			{canWrite ? (
				<AppPageForm tourOperatorId={tourOperatorId} />
			) : (
				<AppNotPermitted />
			)}
		</AppPageShell>
	);
}
