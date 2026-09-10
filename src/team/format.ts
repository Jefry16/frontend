import * as m from "#/paraglide/messages";
import type { Invitation, InvitationStatus, MemberRole } from "./types";

export const roleLabel = (role: MemberRole): string =>
	role === "OWNER"
		? m.role_owner()
		: role === "ADMIN"
			? m.role_admin()
			: m.role_staff();

export const roleBadgeVariant = (role: MemberRole): "default" | "secondary" =>
	role === "OWNER" ? "default" : "secondary";

export const effectiveStatus = (invitation: Invitation): InvitationStatus =>
	invitation.status === "PENDING" && invitation.expired
		? "EXPIRED"
		: invitation.status;

export const statusLabel = (status: InvitationStatus): string =>
	status === "PENDING"
		? m.status_pending()
		: status === "ACCEPTED"
			? m.status_accepted()
			: status === "REVOKED"
				? m.status_revoked()
				: m.status_expired();

export const statusBadgeVariant = (
	status: InvitationStatus,
): "default" | "secondary" | "outline" =>
	status === "PENDING"
		? "default"
		: status === "ACCEPTED"
			? "secondary"
			: "outline";
