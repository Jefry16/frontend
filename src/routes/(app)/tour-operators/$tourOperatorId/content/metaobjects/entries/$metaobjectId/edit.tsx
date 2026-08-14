import { createFileRoute } from "@tanstack/react-router";
import { AppMetaobjectEdit } from "#/metaobjects";
import { AppWriteGate } from "#/session";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId/edit",
)({
	component: MetaobjectEditPage,
});

function MetaobjectEditPage() {
	const { tourOperatorId, metaobjectId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppMetaobjectEdit
					tourOperatorId={tourOperatorId}
					metaobjectId={metaobjectId}
				/>
			</AppWriteGate>
		</AppPageShell>
	);
}
