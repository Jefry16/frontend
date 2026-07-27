import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppAddAvailabilityDialog, AppSlotsList } from "#/slots";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/availability/",
)({
	component: AvailabilityPage,
});

// Availability: the operator's departures across all experiences, soonest
// first. Adding availability starts with an experience picker (availability is
// per-experience), then the editor. Table page → full width.
function AvailabilityPage() {
	const { tourOperatorId } = Route.useParams();
	const [addOpen, setAddOpen] = useState(false);
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.availability()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.catalog() }, { label: m.availability() }]}
					/>
				}
				actions={
					<Button onClick={() => setAddOpen(true)}>
						<Plus />
						{m.add_availability()}
					</Button>
				}
			/>
			<AppSlotsList
				tourOperatorId={tourOperatorId}
				emptyAction={
					<Button onClick={() => setAddOpen(true)}>
						<Plus />
						{m.add_availability()}
					</Button>
				}
			/>
			<AppAddAvailabilityDialog
				tourOperatorId={tourOperatorId}
				open={addOpen}
				onOpenChange={setAddOpen}
			/>
		</AppPageShell>
	);
}
