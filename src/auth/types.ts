export interface TourOperatorSummary {
	id: string;
	name: string;
	logoUrl: string | null;
	timezone: string;
	currency: string;
	isDefault: boolean;
	role: "OWNER" | "ADMIN" | "STAFF";
}

export interface InvitationPreview {
	context: "invitation-previews";
	operatorName: string;
	email: string;
}

export interface AcceptInvitationResponse {
	id: string;
	context: "tour-operators";
	operatorName: string;
	accessToken: string | null;
}

export interface AuthUser {
	id: string;
	context: "users";
	name: string;
	avatarUrl: string | null;
	language: string;
	tourOperators: TourOperatorSummary[];
}
