import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppCategoryForm } from "#/categories";
import * as m from "#/paraglide/messages";
import { AppWriteGate } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/categories/new",
)({
	component: NewCategoryPage,
});

function NewCategoryPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.new_category()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{ label: m.catalog() },
							{
								label: m.categories(),
								to: "/tour-operators/$tourOperatorId/categories",
								params: { tourOperatorId },
							},
							{ label: m.new_category() },
						]}
					/>
				}
			/>
			<AppWriteGate>
				<AppCategoryForm tourOperatorId={tourOperatorId} />
			</AppWriteGate>
		</AppPageShell>
	);
}
