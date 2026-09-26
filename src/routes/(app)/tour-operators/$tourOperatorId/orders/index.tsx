import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppOrdersList } from "#/sales";
import { AppBreadcrumb } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/orders/",
)({
	component: OrdersPage,
});

function OrdersPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.orders()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.operations() }, { label: m.orders() }]}
					/>
				}
			/>
			<AppOrdersList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
