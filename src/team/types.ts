export type MemberRole = "OWNER" | "ADMIN" | "STAFF";

export interface Member {
	id: string;
	context: "users";
	role: MemberRole;
	joinedAt: string;
	name: string | null;
	email: string | null;
}

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

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
