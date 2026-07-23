// Central registry of React Query keys. Grows one entry per feature — each new
// module adds the keys its queries use here, so invalidations stay consistent
// and collisions are visible in one place.
export const queryKeys = {
	authProfile: ["auth", "profile"] as const,
	timezones: ["timezones"] as const,
	currencies: ["currencies"] as const,
	members: (tourOperatorId: string) => ["members", tourOperatorId] as const,
	invitations: (tourOperatorId: string) =>
		["invitations", tourOperatorId] as const,
	invitation: (tourOperatorId: string, invitationId: string) =>
		["invitations", tourOperatorId, invitationId] as const,
};
