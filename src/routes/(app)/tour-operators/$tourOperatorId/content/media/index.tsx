import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import { AppMediaList, AppMediaUploadButton } from "#/media";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/media/",
)({
	component: MediaPage,
});

function MediaPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<AppPageShell variant="list">
			<AppPageHeader
				title={m.media()}
				breadcrumb={
					<AppBreadcrumb
						items={[{ label: m.content() }, { label: m.media() }]}
					/>
				}
				actions={<AppMediaUploadButton tourOperatorId={tourOperatorId} />}
			/>
			<AppMediaList tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
