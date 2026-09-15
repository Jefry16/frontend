import {
	AppFormSkeleton,
	AppLoadingBlock,
	AppLocaleTabs,
	AppPageHeader,
	AppQueryState,
	AppResourceView,
	AppTranslationSummary,
	mergeQueryState,
	type TranslatedField,
} from "@vointika/ui";
import { Scale } from "lucide-react";
import { useState } from "react";
import * as m from "#/paraglide/messages";
import { localeLabel, useOperatorLocales, usePermissions } from "#/session";
import { AppNoTranslatableLocales } from "#/shared/components/AppNoTranslatableLocales";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { usePolicy } from "../hooks/use-policy";
import { usePolicyTranslations } from "../hooks/use-policy-translations";
import type { PolicyTranslation } from "../types";
import { AppPolicyTranslationForm } from "./AppPolicyTranslationForm";

export const AppPolicyTranslations = ({
	tourOperatorId,
	policyId,
}: {
	tourOperatorId: string;
	policyId: string;
}) => {
	const { canWrite } = usePermissions();
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
			loading={<AppFormSkeleton rows={3} />}
		>
			{(policy) => (
				<>
					<AppPageHeader
						title={m.translations()}
						description={m.translations_description()}
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

					<AppQueryState
						query={mergeQueryState(localesQuery, listQuery, () => true)}
						loading={<AppLoadingBlock />}
					>
						{() =>
							translatable.length === 0 ? (
								<AppNoTranslatableLocales tourOperatorId={tourOperatorId} />
							) : (
								<div className="flex flex-col gap-4">
									<AppLocaleTabs
										locales={translatable}
										active={active}
										onSelect={setPicked}
										translated={translated}
										label={localeLabel}
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
							)
						}
					</AppQueryState>
				</>
			)}
		</AppResourceView>
	);
};

const policyFields = (t: PolicyTranslation): TranslatedField[] => [
	[m.title(), t.title],
	[m.policy_body(), t.body],
];
