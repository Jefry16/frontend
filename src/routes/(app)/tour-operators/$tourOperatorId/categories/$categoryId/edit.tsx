import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppCategoryEdit } from "#/categories";
import { AppWriteGate } from "#/session";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/categories/$categoryId/edit",
)({
	component: EditCategoryPage,
});

function EditCategoryPage() {
	const { tourOperatorId, categoryId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppWriteGate>
				<AppCategoryEdit
					tourOperatorId={tourOperatorId}
					categoryId={categoryId}
				/>
			</AppWriteGate>
		</AppPageShell>
	);
}
