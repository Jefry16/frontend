import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	type AppAction,
	AppBadge,
	AppDetailField,
	AppDetailSkeleton,
	AppPageActions,
	AppPageHeader,
	Card,
	CardContent,
	EmptyValue,
} from "@vointika/ui";
import { Crown, LogOut, Trash2, UserCog, Users } from "lucide-react";
import { AppActivityCard } from "#/audit";
import { useAuth } from "#/auth";
import { useAppToast } from "#/hooks/use-app-toast";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { roleBadgeVariant, roleLabel } from "../format";
import { useMember } from "../hooks/use-member";
import { useMemberActions } from "../hooks/use-member-actions";
import type { Member, MemberRole } from "../types";

export const AppMemberDetail = ({
	tourOperatorId,
	userId,
}: {
	tourOperatorId: string;
	userId: string;
}) => {
	const { canWrite, isOwner } = usePermissions();
	const { user } = useAuth();
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const query = useMember(tourOperatorId, userId);
	const { changeRole, transferOwnership, remove } = useMemberActions(
		tourOperatorId,
		userId,
	);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/settings/members"
			params={{ tourOperatorId }}
		>
			{m.back_to_members()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.member()}
			icon={Users}
			breadcrumb={
				<AppBreadcrumb
					items={[
						{
							label: m.settings(),
							to: "/tour-operators/$tourOperatorId/settings",
							params: { tourOperatorId },
						},
						{ label: m.members() },
					]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={3} variant="labelled" />}
		>
			{(member) => {
				const isSelf = user?.id === member.id;
				const label = member.name ?? member.email ?? m.member();

				const actions: AppAction[] = [];
				if (isSelf) {
					if (member.role !== "OWNER") {
						actions.push({
							id: "leave",
							label: m.leave_team(),
							icon: LogOut,
							variant: "destructive",
							member: true,
							pending: remove.isPending,
							confirm: {
								title: m.leave_team_title(),
								description: m.leave_team_body(),
							},
							onSelect: () =>
								remove.mutate(undefined, {
									onSuccess: () => {
										toast.success(m.left_team());
										queryClient.removeQueries({
											queryKey: queryKeys.member(tourOperatorId, userId),
										});
										queryClient.invalidateQueries({
											queryKey: queryKeys.authProfile,
										});
										navigate({ to: "/" });
									},
								}),
						});
					}
				} else if (member.role !== "OWNER") {
					const target: MemberRole =
						member.role === "STAFF" ? "ADMIN" : "STAFF";
					actions.push({
						id: "role",
						label: target === "ADMIN" ? m.make_admin() : m.make_staff(),
						icon: UserCog,
						onSelect: () => changeRole.mutate(target),
						pending: changeRole.isPending,
					});
					if (isOwner) {
						actions.push({
							id: "transfer",
							label: m.make_owner(),
							icon: Crown,
							pending: transferOwnership.isPending,
							confirm: {
								title: m.transfer_ownership_title({ name: label }),
								description: m.transfer_ownership_body(),
							},
							onSelect: () => transferOwnership.mutate(),
						});
					}
					actions.push({
						id: "remove",
						label: m.remove_member(),
						icon: Trash2,
						variant: "destructive",
						pending: remove.isPending,
						confirm: {
							title: m.remove_member_title({ name: label }),
							description: m.remove_member_body(),
						},
						onSelect: () =>
							remove.mutate(undefined, {
								onSuccess: () => {
									toast.success(m.member_removed());
									queryClient.removeQueries({
										queryKey: queryKeys.member(tourOperatorId, userId),
									});
									navigate({
										to: "/tour-operators/$tourOperatorId/settings/members",
										params: { tourOperatorId },
									});
								},
							}),
					});
				}

				return (
					<MemberFacts
						member={member}
						label={label}
						tourOperatorId={tourOperatorId}
						actions={actions}
						canWrite={canWrite}
					/>
				);
			}}
		</AppResourceView>
	);
};

const MemberFacts = ({
	member,
	label,
	tourOperatorId,
	actions,
	canWrite,
}: {
	member: Member;
	label: string;
	tourOperatorId: string;
	actions: AppAction[];
	canWrite: boolean;
}) => {
	const { formatDate } = useOperatorDateTime();

	return (
		<>
			<AppPageHeader
				title={label}
				description={member.name ? (member.email ?? undefined) : undefined}
				breadcrumb={
					<AppBreadcrumb
						items={[
							{
								label: m.settings(),
								to: "/tour-operators/$tourOperatorId/settings",
								params: { tourOperatorId },
							},
							{
								label: m.members(),
								to: "/tour-operators/$tourOperatorId/settings/members",
								params: { tourOperatorId },
							},
							{ label },
						]}
					/>
				}
				actions={<AppPageActions actions={actions} canWrite={canWrite} />}
			/>
			<Card>
				<CardContent>
					<dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<AppDetailField label={m.role()}>
							<AppBadge variant={roleBadgeVariant(member.role)}>
								{roleLabel(member.role)}
							</AppBadge>
						</AppDetailField>
						<AppDetailField label={m.email()}>
							{member.email ?? <EmptyValue />}
						</AppDetailField>
						<AppDetailField label={m.joined()}>
							{formatDate(member.joinedAt)}
						</AppDetailField>
					</dl>
				</CardContent>
			</Card>
			<AppActivityCard
				tourOperatorId={tourOperatorId}
				entityType="MEMBER"
				entityId={member.id}
			/>
		</>
	);
};
