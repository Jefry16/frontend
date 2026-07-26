import { createFileRoute } from "@tanstack/react-router";
import { AppSlotDetail } from "#/slots";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/availability/$slotId/",
)({
	component: SlotDetailPage,
});

// Single-resource page → centered at max-w-3xl (list pages go full width).
function SlotDetailPage() {
	const { tourOperatorId, slotId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<AppSlotDetail tourOperatorId={tourOperatorId} slotId={slotId} />
		</div>
	);
}
