import { Scale } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { localeLabel, useOperatorLocales } from "#/session";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppFormSkeleton } from "#/shared/components/AppFormSkeleton";
import { AppLoadingBlock } from "#/shared/components/AppLoadingBlock";
import { AppLocaleTabs } from "#/shared/components/AppLocaleTabs";
import { AppNoTranslatableLocales } from "#/shared/components/AppNoTranslatableLocales";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import {
	AppTranslationSummary,
	type TranslatedField,
} from "#/shared/components/AppTranslationSummary";
import { usePolicy } from "../hooks/use-policy";
import { usePolicyTranslations } from "../hooks/use-policy-translations";
import type { PolicyTranslation } from "../types";
import { AppPolicyTranslationForm } from "./AppPolicyTranslationForm";

// Reads ONE query, unlike the page and experience editors: there is no
// per-locale GET, so the active row comes out of the list the switcher needs
// anyway.
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

	// An untranslated locale has no row at all, so the empty overlay is ours.
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
					<AppFormSkeleton rows={3} />
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
						<AppLoadingBlock />
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

// The two fields the form edits.
const policyFields = (t: PolicyTranslation): TranslatedField[] => [
	[m.title(), t.title],
	[m.policy_body(), t.body],
];
