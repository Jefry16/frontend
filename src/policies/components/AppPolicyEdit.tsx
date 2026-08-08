import { Scale } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { usePolicy } from "../hooks/use-policy";
import { AppPolicyForm } from "./AppPolicyForm";

// The edit page: loads the record, then renders the form seeded with it. The
// type is not editable — the form drops its picker once it has a policy.
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
			loading={
				<Card>
					<CardContent className="flex flex-col gap-4">
						{["a", "b", "c"].map((k) => (
							<Skeleton key={k} className="h-10 w-full" />
						))}
					</CardContent>
				</Card>
			}
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
