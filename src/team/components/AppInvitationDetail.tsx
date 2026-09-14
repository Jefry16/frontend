import {
	type AppAction,
	AppBadge,
	AppDetailField,
	AppDetailSkeleton,
	AppPageActions,
	AppPageHeader,
	Card,
	CardContent,
} from "@vointika/ui";
import { Mail, Send, Trash2 } from "lucide-react";
import { AppActivityCard } from "#/audit";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
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
			loading={<AppDetailSkeleton fields={4} variant="labelled" />}
		>
			{(invitation) => {
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
