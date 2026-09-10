import { createFileRoute, redirect } from "@tanstack/react-router";

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
