import { createFileRoute } from "@tanstack/react-router";
import { AppPageHeader, AppPageShell } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/links";
import { AppOperatorTranslations } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/translations/",
)({
	component: TranslationsSettingsPage,
});

function TranslationsSettingsPage() {
	const { tourOperatorId } = Route.useParams();
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
			<AppOperatorTranslations tourOperatorId={tourOperatorId} />
		</AppPageShell>
	);
}
