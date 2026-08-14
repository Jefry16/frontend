import { createFileRoute } from "@tanstack/react-router";
import {
	AppMetafieldTranslationsCard,
	useMetafieldTranslationLocales,
} from "#/metafields";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppPageShell } from "#/shared/components/AppPageShell";
import { AppOperatorTranslations, usePermissions } from "#/tour-operator";

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
	const { canWrite } = usePermissions();
	// The operator is its own metafield owner, so it is its own ownerId. This
	// lives here rather than inside AppOperatorTranslations because tour-operator
	// cannot import metafields — see that component's note.
	const metafieldLocales = useMetafieldTranslationLocales(
		tourOperatorId,
		"tour_operator",
		tourOperatorId,
	);

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
				alsoTranslated={metafieldLocales.data ?? []}
				perLocale={(locale) => (
					<AppMetafieldTranslationsCard
						key={locale}
						tourOperatorId={tourOperatorId}
						ownerType="tour_operator"
						ownerId={tourOperatorId}
						locale={locale}
						canWrite={canWrite}
					/>
				)}
			/>
		</AppPageShell>
	);
}
