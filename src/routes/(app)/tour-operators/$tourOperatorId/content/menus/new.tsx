import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppMenuForm } from "#/menus";
import * as m from "#/paraglide/messages";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/menus/new",
)({
	component: NewMenuPage,
});

function NewMenuPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppPageHeader
					title={m.new_menu()}
					breadcrumb={
						<AppBreadcrumb
							items={[
								{ label: m.content() },
								{
									label: m.menus(),
									to: "/tour-operators/$tourOperatorId/content/menus",
									params: { tourOperatorId },
								},
								{ label: m.new_menu() },
							]}
						/>
					}
				/>
				<AppMenuForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
