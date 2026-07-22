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
