import { createFileRoute } from "@tanstack/react-router";
import {
	AppBadge,
	AppDetailField,
	AppPageHeader,
	AppPageShell,
	AppResourceView,
	Card,
	CardContent,
	Skeleton,
} from "@vointika/ui";
import { Languages } from "lucide-react";
import * as m from "#/paraglide/messages";
import {
	localeLabel,
	type OperatorLocales,
	useOperatorLocales,
	usePermissions,
} from "#/session";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { AppOperatorLanguagesForm } from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/languages/",
)({
	component: LanguagesSettingsPage,
});

function LanguagesSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	const { canWrite } = usePermissions();
	const query = useOperatorLocales(tourOperatorId);

	const breadcrumb = (
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
	);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/settings"
			params={{ tourOperatorId }}
		>
			{m.back_to_settings()}
		</AppBackLink>
	);

	return (
		<AppPageShell variant="form">
			<AppResourceView
				query={query}
				resource={m.languages()}
				icon={Languages}
				breadcrumb={breadcrumb}
				notFoundAction={backLink}
				loading={
					<Card>
						<CardContent className="flex flex-col gap-4">
							<Skeleton className="h-5 w-40" />
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
								{["a", "b", "c", "d"].map((k) => (
									<Skeleton key={k} className="h-6 w-full" />
								))}
							</div>
							<Skeleton className="h-9 w-full" />
						</CardContent>
					</Card>
				}
			>
				{(locales) => (
					<>
						<AppPageHeader
							title={m.languages()}
							description={m.languages_description()}
							breadcrumb={breadcrumb}
						/>
						{canWrite ? (
							<AppOperatorLanguagesForm
								tourOperatorId={tourOperatorId}
								locales={locales}
							/>
						) : (
							<LanguagesSummary locales={locales} />
						)}
					</>
				)}
			</AppResourceView>
		</AppPageShell>
	);
}

function LanguagesSummary({ locales }: { locales: OperatorLocales }) {
	return (
		<Card>
			<CardContent>
				<dl className="flex flex-col gap-6">
					<AppDetailField label={m.primary_language()}>
						{localeLabel(locales.primaryLocale)}
					</AppDetailField>
					<AppDetailField label={m.supported_languages()}>
						<div className="flex flex-wrap gap-1.5">
							{locales.supportedLocales.map((code) => (
								<AppBadge key={code} variant="secondary">
									{localeLabel(code)}
								</AppBadge>
							))}
						</div>
					</AppDetailField>
				</dl>
			</CardContent>
		</Card>
	);
}
