import { createFileRoute } from "@tanstack/react-router";
import { AppAudienceEdit } from "#/audiences";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/$audienceId/edit",
)({
	component: EditAudiencePage,
});

// Single-resource page → centered at max-w-3xl.
function EditAudiencePage() {
	const { tourOperatorId, audienceId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<AppAudienceEdit
				tourOperatorId={tourOperatorId}
				audienceId={audienceId}
			/>
		</div>
	);
}
