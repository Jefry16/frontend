export type MemberRole = "OWNER" | "ADMIN" | "STAFF";

// One team-roster row (GET /tour-operators/{id}/members). Per the house
// convention a member is a user carrying a role, so `id` is the user's id and
// `context` is "users". name/email are best-effort (null if the account can't
// be resolved from identity).
export interface Member {
	id: string;
	context: "users";
	role: MemberRole;
	joinedAt: string;
	name: string | null;
	email: string | null;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

// One invitation row (GET /tour-operators/{id}/invitations). `id` is the
// invitation's id, `context` is "invitations". Invitee name/email are typed by
// the inviter (never null); `invitedBy.name` is a snapshot of the inviting admin
// frozen at issue time. `expired` is server-computed for the page (a PENDING row
// past its window); `role` is only ever ADMIN or STAFF (never OWNER).
export interface Invitation {
	id: string;
	context: "invitations";
	email: string;
	name: string;
	role: MemberRole;
	status: InvitationStatus;
	expired: boolean;
	createdAt: string;
	expiresAt: string;
	acceptedAt: string | null;
	invitedBy: {
		id: string;
		context: "users";
		name: string;
	};
}
