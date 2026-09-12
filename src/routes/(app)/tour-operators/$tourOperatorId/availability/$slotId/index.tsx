import { createFileRoute } from "@tanstack/react-router";
import { AppPageShell } from "@vointika/ui";
import { AppSlotDetail } from "#/slots";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/availability/$slotId/",
)({
	component: SlotDetailPage,
});

function SlotDetailPage() {
	const { tourOperatorId, slotId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppSlotDetail tourOperatorId={tourOperatorId} slotId={slotId} />
		</AppPageShell>
	);
}
