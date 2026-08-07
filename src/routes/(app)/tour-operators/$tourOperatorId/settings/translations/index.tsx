import { createFileRoute } from "@tanstack/react-router";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import {
	AppOperatorTranslations,
	useCurrentTourOperator,
} from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/translations/",
)({
	component: TranslationsSettingsPage,
});

// The operator's own shop text, per supported language. Editing is ADMIN+ (STAFF
// would 403 on save), so the role decides form vs read-only summary — the same
// split the Languages section makes.
function TranslationsSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	const operator = useCurrentTourOperator();
	const canWrite = operator?.role === "OWNER" || operator?.role === "ADMIN";

	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.translations()}
				description={m.operator_translations_description()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{ label: m.translations() },
						]}
					/>
				}
			/>
			<AppOperatorTranslations
				tourOperatorId={tourOperatorId}
				canWrite={canWrite}
			/>
		</AppPageShell>
	);
}
