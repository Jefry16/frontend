import { useNavigate } from "@tanstack/react-router";
import { Languages, Pencil, Scale, Trash2 } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useAppToast } from "#/hooks/use-app-toast";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useOperatorDateTime, usePermissions } from "#/tour-operator";
import { policySlug, policyTypeLabel } from "../format";
import { usePolicy } from "../hooks/use-policy";
import { usePolicyActions } from "../hooks/use-policy-actions";

// One policy: its type, the storefront path it renders at, and the raw body.
//
// No activity card: the backend hangs policy entries off the OPERATOR
// (entityType TOUR_OPERATOR, entityId the operator's) like locales and SEO, so a
// policy-scoped timeline would query an entity that has no entries and render
// empty. The writes show up in Operations -> Activity.
//
// The body is shown as SOURCE, not rendered. It is operator-authored HTML that
// the storefront deliberately renders unescaped; echoing it into the admin as
// markup would run their script in the operator's own session, and the admin has
// no reason to preview what the storefront already shows.
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
							actions={
								<AppPageActions
									actions={actions.filter(
										(a) => canWrite || a.id === "translations",
									)}
								/>
							}
						/>
						<Card>
							<CardContent className="flex flex-col gap-6">
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
									<pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted/40 p-3 font-mono text-xs">
										{policy.body}
									</pre>
								</AppDetailField>
							</CardContent>
						</Card>
					</>
				);
			}}
		</AppResourceView>
	);
};
