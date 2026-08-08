import { Mail, Send, Trash2 } from "lucide-react";
import { AppActivityCard } from "#/audit";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
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
import {
	effectiveStatus,
	roleBadgeVariant,
	roleLabel,
	statusBadgeVariant,
	statusLabel,
} from "../format";
import { useInvitation } from "../hooks/use-invitation";
import { useInvitationActions } from "../hooks/use-invitation-actions";
import type { Invitation } from "../types";

// Read-only invitation detail (invitee, role, status, who invited, dates). Owns
// its fetch — skeleton while loading, empty state on a 404/error. The name
// column of the list links here.
export const AppInvitationDetail = ({
	tourOperatorId,
	invitationId,
}: {
	tourOperatorId: string;
	invitationId: string;
}) => {
	const query = useInvitation(tourOperatorId, invitationId);
	const { resend, revoke } = useInvitationActions(tourOperatorId, invitationId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/settings/invitations"
			params={{ tourOperatorId }}
		>
			{m.back_to_invitations()}
		</AppBackLink>
	);

	const { canWrite } = usePermissions();

	return (
		<AppResourceView
			query={query}
			resource={m.invitation()}
			icon={Mail}
			breadcrumb={
				<AppBreadcrumb
					items={[
						{
							label: m.settings(),
							to: "/tour-operators/$tourOperatorId/settings",
							params: { tourOperatorId },
						},
						{ label: m.invitations() },
					]}
				/>
			}
			notFoundAction={backLink}
			loading={
				<Card>
					<CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						{["a", "b", "c", "d"].map((k) => (
							<div key={k} className="flex flex-col gap-2">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-5 w-32" />
							</div>
						))}
					</CardContent>
				</Card>
			}
		>
			{(invitation) => {
				// Actions apply only while the invitation is live (stored PENDING — an
				// "Expired" row is still PENDING and can be resent or revoked). Terminal
				// states (ACCEPTED / REVOKED) offer none.
				const actions: AppAction[] =
					invitation.status === "PENDING"
						? [
								{
									id: "resend",
									label: m.resend(),
									icon: Send,
									onSelect: () => resend.mutate(),
									pending: resend.isPending,
								},
								{
									id: "revoke",
									label: m.revoke(),
									icon: Trash2,
									variant: "destructive",
									pending: revoke.isPending,
									confirm: {
										title: m.revoke_invitation_title(),
										description: m.revoke_invitation_body(),
									},
									onSelect: () => revoke.mutate(),
								},
							]
						: [];

				return (
					<InvitationFacts
						invitation={invitation}
						tourOperatorId={tourOperatorId}
						actions={actions}
						canWrite={canWrite}
					/>
				);
			}}
		</AppResourceView>
	);
};

// The facts, split out so it renders once `invitation` is known (non-null).
const InvitationFacts = ({
	invitation,
	tourOperatorId,
	actions,
	canWrite,
}: {
	invitation: Invitation;
	tourOperatorId: string;
	actions: AppAction[];
	canWrite: boolean;
}) => {
	const { formatDateTime: format } = useOperatorDateTime();
	const status = effectiveStatus(invitation);

	return (
		<>
			<AppPageHeader
				title={invitation.name}
				description={invitation.email}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{
								label: m.invitations(),
								to: "/tour-operators/$tourOperatorId/settings/invitations",
								params: { tourOperatorId },
							},
							{ label: invitation.name },
						]}
					/>
				}
				actions={<AppPageActions actions={actions} canWrite={canWrite} />}
			/>
			<Card>
				<CardContent>
					<dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<AppDetailField label={m.role()}>
							<AppBadge variant={roleBadgeVariant(invitation.role)}>
								{roleLabel(invitation.role)}
							</AppBadge>
						</AppDetailField>
						<AppDetailField label={m.status()}>
							<AppBadge variant={statusBadgeVariant(status)}>
								{statusLabel(status)}
							</AppBadge>
						</AppDetailField>
						<AppDetailField label={m.invited_by()}>
							{invitation.invitedBy.name}
						</AppDetailField>
						<AppDetailField label={m.sent()}>
							{format(invitation.createdAt)}
						</AppDetailField>
						<AppDetailField label={m.expires()}>
							{format(invitation.expiresAt)}
						</AppDetailField>
						{invitation.acceptedAt && (
							<AppDetailField label={m.accepted()}>
								{format(invitation.acceptedAt)}
							</AppDetailField>
						)}
					</dl>
				</CardContent>
			</Card>
			<AppActivityCard
				tourOperatorId={tourOperatorId}
				entityType="INVITATION"
				entityId={invitation.id}
			/>
		</>
	);
};
