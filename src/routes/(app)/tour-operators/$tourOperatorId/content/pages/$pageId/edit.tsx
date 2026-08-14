import { createFileRoute } from "@tanstack/react-router";
import { AppPageEdit } from "#/pages";
import { AppWriteGate } from "#/session";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/pages/$pageId/edit",
)({
	component: EditPagePage,
});

function EditPagePage() {
	const { tourOperatorId, pageId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppPageEdit tourOperatorId={tourOperatorId} pageId={pageId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
