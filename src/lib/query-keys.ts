// Central registry of React Query keys. Grows one entry per feature — each new
// module adds the keys its queries use here, so invalidations stay consistent
// and collisions are visible in one place.
export const queryKeys = {
	authProfile: ["auth", "profile"] as const,
	timezones: ["timezones"] as const,
	currencies: ["currencies"] as const,
};
