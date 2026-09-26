import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppBookingsList } from "#/sales";
import { AppBreadcrumb } from "#/shared/links";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/bookings/",
)({
	component: BookingsPage,
});

function BookingsPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.bookings()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.operations() }, { label: m.bookings() }]}
					/>
				}
			/>
			<AppBookingsList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
