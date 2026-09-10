import { createFileRoute } from "@tanstack/react-router";
import { AppCategoryEdit } from "#/categories";
import { AppWriteGate } from "#/session";
import { AppPageShell } from "#/shared/components/AppPageShell";

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
