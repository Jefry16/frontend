import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppOrderDetail } from "#/sales";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/orders/$orderId",
)({
	component: OrderPage,
});

function OrderPage() {
	const { tourOperatorId, orderId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppOrderDetail tourOperatorId={tourOperatorId} orderId={orderId} />
		</AppPageShell>
	);
}
