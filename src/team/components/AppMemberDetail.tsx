import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Crown, LogOut, Trash2, UserCog, UserX } from "lucide-react";
import { useAuth } from "#/auth";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useAppToast } from "#/hooks/use-app-toast";
import { apiErrorMessage, isNotFound } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppError } from "#/shared/components/AppError";
import { AppLink } from "#/shared/components/AppLink";
import { AppNotFound } from "#/shared/components/AppNotFound";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { useCurrentTourOperator } from "#/tour-operator";
import { roleBadgeVariant, roleLabel } from "../format";
import { useMember } from "../hooks/use-member";
import { useMemberActions } from "../hooks/use-member-actions";
import type { Member, MemberRole } from "../types";

const dash = () => <span className="text-muted-foreground">—</span>;

// Read-only member detail (role, email, joined) plus the mutating actions —
// change role and remove/leave — via the shared action pattern. Owns its fetch
// (skeleton / 404 empty state). The roster's name column links here.
export const AppMemberDetail = ({
	tourOperatorId,
	userId,
}: {
	tourOperatorId: string;
	userId: string;
}) => {
	const operator = useCurrentTourOperator();
	const timeZone = operator?.timezone;
	const callerRole = operator?.role;
	const { user } = useAuth();
	const navigate = useNavigate();
	const toast = useAppToast();
	const queryClient = useQueryClient();
	const {
		data: member,
		isPending,
		error,
		refetch,
	} = useMember(tourOperatorId, userId);
	const { changeRole, transferOwnership, remove } = useMemberActions(
		tourOperatorId,
		userId,
	);

	const backLink = (
		<AppLink
			to="/tour-operators/$tourOperatorId/settings/members"
			params={{ tourOperatorId }}
			className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft className="size-4" />
			{m.back_to_members()}
		</AppLink>
	);
	// Settings / Members, until the specific member resolves (then the name is added).
	const sectionBreadcrumb = (
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
	);

	if (isPending) {
		return (
			<>
				<AppPageHeader title={m.member()} breadcrumb={sectionBreadcrumb} />
				<Card>
					<CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						{["a", "b", "c"].map((k) => (
							<div key={k} className="flex flex-col gap-2">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-5 w-32" />
							</div>
						))}
					</CardContent>
				</Card>
			</>
		);
	}

	if (error || !member) {
		return (
			<>
				<AppPageHeader title={m.member()} breadcrumb={sectionBreadcrumb} />
				{isNotFound(error) ? (
					<AppNotFound resource={m.member()} icon={UserX} action={backLink} />
				) : (
					<AppError
						description={apiErrorMessage(error)}
						onRetry={() => refetch()}
					/>
				)}
			</>
		);
	}

	const isSelf = user?.id === member.id;
	const isAdmin = callerRole === "OWNER" || callerRole === "ADMIN";
	const isOwnerCaller = callerRole === "OWNER";
	const label = member.name ?? member.email ?? m.member();

	// Actions mirror the backend guards (which are the real gate — the UI just
	// hides what a viewer can't do):
	// - Viewing yourself → Leave (but the owner can't leave without transferring).
	// - An ADMIN+ managing another non-owner member → role toggle + Remove, and if
	//   the caller is the OWNER, also "Make owner" (transfers ownership, demoting
	//   the caller to admin).
	const actions: AppAction[] = [];
	if (isSelf) {
		if (member.role !== "OWNER") {
			actions.push({
				id: "leave",
				label: m.leave_team(),
				icon: LogOut,
				variant: "destructive",
				pending: remove.isPending,
				confirm: {
					title: m.leave_team_title(),
					description: m.leave_team_body(),
				},
				onSelect: () =>
					remove.mutate(undefined, {
						onSuccess: () => {
							toast.success(m.left_team());
							// Their memberships changed — refresh the profile, then leave.
							queryClient.invalidateQueries({
								queryKey: queryKeys.authProfile,
							});
							navigate({ to: "/" });
						},
					}),
			});
		}
	} else if (isAdmin && member.role !== "OWNER") {
		const target: MemberRole = member.role === "STAFF" ? "ADMIN" : "STAFF";
		actions.push({
			id: "role",
			label: target === "ADMIN" ? m.make_admin() : m.make_staff(),
			icon: UserCog,
			onSelect: () => changeRole.mutate(target),
			pending: changeRole.isPending,
		});
		if (isOwnerCaller) {
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
			timeZone={timeZone}
			actions={actions}
		/>
	);
};

const MemberFacts = ({
	member,
	label,
	tourOperatorId,
	timeZone,
	actions,
}: {
	member: Member;
	label: string;
	tourOperatorId: string;
	timeZone?: string;
	actions: AppAction[];
}) => {
	const dateFormat = new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeZone,
	});

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
				actions={
					actions.length > 0 ? <AppPageActions actions={actions} /> : undefined
				}
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
							{member.email ?? dash()}
						</AppDetailField>
						<AppDetailField label={m.joined()}>
							{dateFormat.format(new Date(member.joinedAt))}
						</AppDetailField>
					</dl>
				</CardContent>
			</Card>
		</>
	);
};
