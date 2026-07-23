import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppPageHeader } from "#/shared/components/AppPageHeader";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/members/$userId",
)({
	component: MemberDetailPage,
});

// Member detail — a stub for now (the name column links here). The real detail
// (role, joined, actions) lands with a member get-by-id endpoint, which the
// backend doesn't expose yet.
function MemberDetailPage() {
	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
			<AppPageHeader title={m.member()} />
		</div>
	);
}
