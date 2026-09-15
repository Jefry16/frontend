import { createFileRoute } from "@tanstack/react-router";
import {
	AppFormSkeleton,
	AppPageHeader,
	AppPageShell,
	AppQueryState,
	AppSettingsCard,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { useOperatorLocales, usePermissions } from "#/session";
import { AppBreadcrumb } from "#/shared/links";
import {
	AppOperatorLanguagesForm,
	AppOperatorLanguagesSummary,
} from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/languages/",
)({
	component: LanguagesSettingsPage,
});

function LanguagesSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();
	const query = useOperatorLocales(tourOperatorId);

	return (
		<AppPageShell variant="form">
			<AppPageHeader
				title={m.languages()}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{ label: m.languages() },
						]}
					/>
				}
			/>
			<AppSettingsCard
				title={m.supported_languages()}
				description={m.languages_description()}
			>
				<AppQueryState
					query={query}
					loading={<AppFormSkeleton rows={2} card={false} />}
				>
					{(locales) =>
						canWrite ? (
							<AppOperatorLanguagesForm
								tourOperatorId={tourOperatorId}
								locales={locales}
							/>
						) : (
							<AppOperatorLanguagesSummary locales={locales} />
						)
					}
				</AppQueryState>
			</AppSettingsCard>
		</AppPageShell>
	);
}
