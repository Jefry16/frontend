import { createFileRoute } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import {
	AppOperatorLanguagesForm,
	localeLabel,
	type OperatorLocales,
	useCurrentTourOperator,
	useOperatorLocales,
} from "#/tour-operator";

export const Route = createFileRoute(
	"/(app)/tour-operators/$tourOperatorId/settings/languages/",
)({
	component: LanguagesSettingsPage,
});

// The operator's content languages. Reads are member-visible; editing is ADMIN+
// (STAFF would 403 on save), so staff get a read-only summary rather than a dead
// form — mirroring how the members section is visible to all members.
function LanguagesSettingsPage() {
	const { tourOperatorId } = Route.useParams();
	const operator = useCurrentTourOperator();
	const canManage = operator?.role === "OWNER" || operator?.role === "ADMIN";
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

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
			<AppResourceView
				query={query}
				resource={m.languages()}
				icon={Languages}
				breadcrumb={breadcrumb}
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
						{canManage ? (
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
		</div>
	);
}

// Read-only view for non-admins: the configured languages, no editing.
function LanguagesSummary({ locales }: { locales: OperatorLocales }) {
	return (
		<Card>
			<CardContent className="flex flex-col gap-6">
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
			</CardContent>
		</Card>
	);
}
