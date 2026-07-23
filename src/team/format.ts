import * as m from "#/paraglide/messages";
import type { Invitation, InvitationStatus, MemberRole } from "./types";

/** Localized role name. */
export const roleLabel = (role: MemberRole): string =>
	role === "OWNER"
		? m.role_owner()
		: role === "ADMIN"
			? m.role_admin()
			: m.role_staff();

/** Badge variant per role — the owner stands out; the rest are neutral. */
export const roleBadgeVariant = (role: MemberRole): "default" | "secondary" =>
	role === "OWNER" ? "default" : "secondary";

// The status to SHOW for an invitation: a PENDING row past its window reads as
// EXPIRED (the server flags it via `expired` but keeps the stored status PENDING
// until a resend/accept transitions it).
export const effectiveStatus = (invitation: Invitation): InvitationStatus =>
	invitation.status === "PENDING" && invitation.expired
		? "EXPIRED"
		: invitation.status;

/** Localized invitation status. */
export const statusLabel = (status: InvitationStatus): string =>
	status === "PENDING"
		? m.status_pending()
		: status === "ACCEPTED"
			? m.status_accepted()
			: status === "REVOKED"
				? m.status_revoked()
				: m.status_expired();

/** Badge variant per status — PENDING draws the eye; terminal states are muted. */
export const statusBadgeVariant = (
	status: InvitationStatus,
): "default" | "secondary" | "outline" =>
	status === "PENDING"
		? "default"
		: status === "ACCEPTED"
			? "secondary"
			: "outline";
