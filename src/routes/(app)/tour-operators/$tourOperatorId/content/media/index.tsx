import { createFileRoute } from "@tanstack/react-router";
import { AppMediaList, AppMediaUploadButton } from "#/media";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/content/media/",
)({
	component: MediaPage,
});

// Media library: the operator's uploaded images/files. Table page → full width.
function MediaPage() {
	const { tourOperatorId } = Route.useParams();
	return (
		<div className="flex flex-col gap-6 p-6">
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
		</div>
	);
}
