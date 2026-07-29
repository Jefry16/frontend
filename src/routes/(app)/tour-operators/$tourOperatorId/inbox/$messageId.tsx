import { createFileRoute } from "@tanstack/react-router";
import { AppContactMessageDetail } from "#/contact";
import { AppPageShell } from "#/shared/components/AppPageShell";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/inbox/$messageId",
)({
	component: ContactMessagePage,
});

function ContactMessagePage() {
	const { tourOperatorId, messageId } = Route.useParams();
	return (
		<AppPageShell variant="detail">
			<AppContactMessageDetail
				tourOperatorId={tourOperatorId}
				messageId={messageId}
			/>
		</AppPageShell>
	);
}
