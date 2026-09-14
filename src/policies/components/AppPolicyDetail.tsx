import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	type AppAction,
	AppBadge,
	AppDetailField,
	AppFormSkeleton,
	AppPageActions,
	AppPageHeader,
	AppResourceView,
	AppSourceBlock,
	Card,
	CardContent,
} from "@vointika/ui";
import { Languages, Pencil, Scale, Trash2 } from "lucide-react";
import { useAppToast } from "#/hooks/use-app-toast";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { policySlug, policyTypeLabel } from "../format";
import { usePolicy } from "../hooks/use-policy";
import { usePolicyActions } from "../hooks/use-policy-actions";

export const AppPolicyDetail = ({
	tourOperatorId,
	policyId,
}: {
	tourOperatorId: string;
	policyId: string;
}) => {
	const query = usePolicy(tourOperatorId, policyId);
	const { remove } = usePolicyActions(tourOperatorId, policyId);
	const { formatDateTime } = useOperatorDateTime();
	const { canWrite } = usePermissions();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toast = useAppToast();

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
			resource={m.policy()}
			icon={Scale}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.content() }, { label: m.policies() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppFormSkeleton rows={3} />}
		>
			{(policy) => {
				const actions: AppAction[] = [
					{
						id: "edit",
						label: m.edit(),
						icon: Pencil,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/content/policies/$policyId/edit",
								params: { tourOperatorId, policyId },
							}),
					},
					{
						id: "translations",
						label: m.translations(),
						icon: Languages,
						member: true,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/content/policies/$policyId/translations",
								params: { tourOperatorId, policyId },
							}),
					},
					{
						id: "delete",
						label: m.delete_policy(),
						icon: Trash2,
						variant: "destructive",
						pending: remove.isPending,
						confirm: {
							title: m.delete_policy_title(),
							description: m.delete_policy_body(),
							confirmLabel: m.delete_policy(),
						},
						onSelect: () =>
							remove.mutate(undefined, {
								onSuccess: () => {
									toast.deleted(m.policy());
									queryClient.removeQueries({
										queryKey: queryKeys.policy(tourOperatorId, policyId),
									});
									navigate({
										to: "/tour-operators/$tourOperatorId/content/policies",
										params: { tourOperatorId },
									});
								},
							}),
					},
				];

				return (
					<>
						<AppPageHeader
							title={policy.title}
							breadcrumb={
								<AppBreadcrumb
									items={[
										{ label: m.content() },
										{
											label: m.policies(),
											to: "/tour-operators/$tourOperatorId/content/policies",
											params: { tourOperatorId },
										},
										{ label: policy.title },
									]}
								/>
							}
							actions={<AppPageActions actions={actions} canWrite={canWrite} />}
						/>
						<Card>
							<CardContent>
								<dl className="flex flex-col gap-6">
									<AppDetailField label={m.policy_type()}>
										<AppBadge variant="secondary">
											{policyTypeLabel(policy.type)}
										</AppBadge>
									</AppDetailField>
									<AppDetailField label={m.storefront_path()}>
										<span className="font-mono text-sm">
											/policies/{policySlug(policy.type)}
										</span>
									</AppDetailField>
									<AppDetailField label={m.last_updated()}>
										{formatDateTime(policy.updatedAt)}
									</AppDetailField>
									<AppDetailField label={m.policy_body()}>
										<AppSourceBlock label={m.policy_body()}>
											{policy.body}
										</AppSourceBlock>
									</AppDetailField>
								</dl>
							</CardContent>
						</Card>
					</>
				);
			}}
		</AppResourceView>
	);
};
