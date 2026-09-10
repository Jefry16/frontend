import { createFileRoute } from "@tanstack/react-router";
import { AppPageForm } from "#/pages";
import * as m from "#/paraglide/messages";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/pages/new",
)({
	component: NewPagePage,
});

function NewPagePage() {
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
			<AppWriteGate>
				<AppPageForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
