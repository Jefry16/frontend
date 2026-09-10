export interface TourOperatorSummary {
	id: string;
	name: string;
	logoUrl: string | null;
	timezone: string;
	currency: string;
	isDefault: boolean;
	role: "OWNER" | "ADMIN" | "STAFF";
}

export interface AuthUser {
	id: string;
	context: "users";
	name: string;
	avatarUrl: string | null;
	language: string;
	tourOperators: TourOperatorSummary[];
}
