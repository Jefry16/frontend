import { createFileRoute } from "@tanstack/react-router";
import { AppAudienceTranslations } from "#/audiences";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/audiences/$audienceId/translations",
)({
	component: AudienceTranslationsPage,
});

// Single-resource page → centered at max-w-3xl.
function AudienceTranslationsPage() {
	const { tourOperatorId, audienceId } = Route.useParams();
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<AppAudienceTranslations
				tourOperatorId={tourOperatorId}
				audienceId={audienceId}
			/>
		</div>
	);
}
