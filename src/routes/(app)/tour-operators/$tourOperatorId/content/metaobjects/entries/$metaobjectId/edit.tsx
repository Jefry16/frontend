import { createFileRoute } from "@tanstack/react-router";
import { AppMetaobjectEdit } from "#/metaobjects";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppWriteGate } from "#/tour-operator";

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
