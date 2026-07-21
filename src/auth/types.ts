// The operators the signed-in user belongs to (from `GET /auth/profile`).
export interface TourOperatorSummary {
	id: string;
	name: string;
	logoUrl: string | null;
	timezone: string;
	isDefault: boolean;
	/** The caller's role in THIS operator (from the profile). Non-null. */
	role: "OWNER" | "ADMIN" | "STAFF";
}

// The signed-in user. Mirrors the backend `ProfileResponse` (`GET /auth/profile`):
// `id` + a `context` discriminator (the house rule — never a prefixed id / `type`).
export interface AuthUser {
	id: string;
	context: "users";
	name: string;
	avatarUrl: string | null;
	language: string;
	tourOperators: TourOperatorSummary[];
}
