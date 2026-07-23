import { createFileRoute, redirect } from "@tanstack/react-router";

// The settings space has no hub page yet — entering it lands on the first
// section (General). When a grouped hub arrives, it replaces this redirect.
export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/",
)({
	beforeLoad: ({ params }) => {
		throw redirect({
			to: "/tour-operators/$tourOperatorId/settings/general",
			params,
		});
	},
});
