import { AppFormSkeleton, AppPageHeader, AppResourceView } from "@vointika/ui";
import { Scale } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { usePolicy } from "../hooks/use-policy";
import { AppPolicyForm } from "./AppPolicyForm";

export const AppPolicyEdit = ({
	tourOperatorId,
	policyId,
}: {
	tourOperatorId: string;
	policyId: string;
}) => {
	const query = usePolicy(tourOperatorId, policyId);

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
			query={query}
			resource={m.edit_policy()}
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
						title={m.edit_policy()}
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
									{ label: m.edit_policy() },
								]}
							/>
						}
					/>
					<AppPolicyForm tourOperatorId={tourOperatorId} policy={policy} />
				</>
			)}
		</AppResourceView>
	);
};
