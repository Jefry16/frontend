import { Scale } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppLocaleTabs } from "#/shared/components/AppLocaleTabs";
import { AppNoTranslatableLocales } from "#/shared/components/AppNoTranslatableLocales";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import {
	AppTranslationSummary,
	type TranslatedField,
} from "#/shared/components/AppTranslationSummary";
import { localeLabel, useOperatorLocales } from "#/tour-operator";
import { usePolicy } from "../hooks/use-policy";
import { usePolicyTranslations } from "../hooks/use-policy-translations";
import type { PolicyTranslation } from "../types";
import { AppPolicyTranslationForm } from "./AppPolicyTranslationForm";

// The policy translations editor — the page-translations shell: a locale
// switcher (supported minus the primary, which IS the canonical content) over a
// per-locale overlay form, keyed by locale so it reseeds on switch.
//
// Unlike the page and experience editors this reads ONE query, not two: the
// resource has no per-locale GET, so the active locale's row comes out of the
// list the switcher already needs.
export const AppPolicyTranslations = ({
	tourOperatorId,
	policyId,
	canWrite,
}: {
	tourOperatorId: string;
	policyId: string;
	canWrite: boolean;
}) => {
	const policyQuery = usePolicy(tourOperatorId, policyId);
	const localesQuery = useOperatorLocales(tourOperatorId);
	const listQuery = usePolicyTranslations(tourOperatorId, policyId);

	const primary = localesQuery.data?.primaryLocale;
	const translatable = (localesQuery.data?.supportedLocales ?? []).filter(
		(code) => code !== primary,
	);
	const [picked, setPicked] = useState<string>();
	const active = picked ?? translatable[0];
	const translated = new Set((listQuery.data ?? []).map((t) => t.locale));

	// An untranslated locale has no row at all — the empty overlay is ours to
	// make, since there is no per-locale GET to return one.
	const overlay: PolicyTranslation = (active &&
		listQuery.data?.find((t) => t.locale === active)) || {
		locale: active ?? "",
		title: null,
		body: null,
	};

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/content/policies"
			params={{ tourOperatorId }}
		>
			{m.back_to_policies()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={policyQuery}
			resource={m.translations()}
			icon={Scale}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.content() }, { label: m.policies() }]}
				/>
			}
			notFoundAction={backLink}
			loading={
				<div className="flex flex-col gap-4">
					<Skeleton className="h-9 w-64" />
					<Card>
						<CardContent className="flex flex-col gap-4">
							{["a", "b", "c"].map((k) => (
								<Skeleton key={k} className="h-9 w-full" />
							))}
						</CardContent>
					</Card>
				</div>
			}
		>
			{(policy) => (
				<>
					<AppPageHeader
						title={m.translations()}
						description={policy.title}
						breadcrumb={
							<AppBreadcrumb
								items={[
									{ label: m.content() },
									{
										label: m.policies(),
										to: "/tour-operators/$tourOperatorId/content/policies",
										params: { tourOperatorId },
									},
									{
										label: policy.title,
										to: "/tour-operators/$tourOperatorId/content/policies/$policyId",
										params: { tourOperatorId, policyId },
									},
									{ label: m.translations() },
								]}
							/>
						}
					/>

					{localesQuery.isPending || listQuery.isPending ? (
						<div className="flex justify-center py-10">
							<Spinner />
						</div>
					) : translatable.length === 0 ? (
						<AppNoTranslatableLocales tourOperatorId={tourOperatorId} />
					) : (
						<div className="flex flex-col gap-4">
							<AppLocaleTabs
								locales={translatable}
								active={active}
								onSelect={setPicked}
								translated={translated}
								label={(code) => localeLabel(code)}
							/>
							{active &&
								(canWrite ? (
									<AppPolicyTranslationForm
										key={active}
										tourOperatorId={tourOperatorId}
										policyId={policyId}
										locale={active}
										canonical={policy}
										translation={overlay}
									/>
								) : (
									<AppTranslationSummary fields={policyFields(overlay)} />
								))}
						</div>
					)}
				</>
			)}
		</AppResourceView>
	);
};

// This resource's rows for AppTranslationSummary — the two fields the form edits.
const policyFields = (t: PolicyTranslation): TranslatedField[] => [
	[m.title(), t.title],
	[m.policy_body(), t.body],
];
