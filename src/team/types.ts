export type MemberRole = "OWNER" | "ADMIN" | "STAFF";

// A member is a user carrying a role, so `id` is the USER's id. name and email
// are null when the account cannot be resolved from identity.
export interface Member {
	id: string;
	context: "users";
	role: MemberRole;
	joinedAt: string;
	name: string | null;
	email: string | null;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

// `invitedBy.name` is frozen at issue time. `expired` is server-computed — the
// row itself stays PENDING — and `role` is never OWNER.
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
