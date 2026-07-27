// Central registry of React Query keys. Grows one entry per feature — each new
// module adds the keys its queries use here, so invalidations stay consistent
// and collisions are visible in one place.
export const queryKeys = {
	authProfile: ["auth", "profile"] as const,
	timezones: ["timezones"] as const,
	currencies: ["currencies"] as const,
	languages: ["languages"] as const,
	uiLanguages: ["ui-languages"] as const,
	operatorLocales: (tourOperatorId: string) =>
		["operator-locales", tourOperatorId] as const,
	members: (tourOperatorId: string) => ["members", tourOperatorId] as const,
	member: (tourOperatorId: string, userId: string) =>
		["members", tourOperatorId, userId] as const,
	invitations: (tourOperatorId: string) =>
		["invitations", tourOperatorId] as const,
	invitation: (tourOperatorId: string, invitationId: string) =>
		["invitations", tourOperatorId, invitationId] as const,
	audiences: (tourOperatorId: string) => ["audiences", tourOperatorId] as const,
	audience: (tourOperatorId: string, audienceId: string) =>
		["audiences", tourOperatorId, audienceId] as const,
	audienceTranslations: (tourOperatorId: string, audienceId: string) =>
		["audiences", tourOperatorId, audienceId, "translations"] as const,
	activity: (tourOperatorId: string) => ["activity", tourOperatorId] as const,
	activityEntry: (tourOperatorId: string, entryId: string) =>
		["activity", tourOperatorId, entryId] as const,
	activityTimeline: (
		tourOperatorId: string,
		entityType: string,
		entityId: string,
	) => ["activity", tourOperatorId, "timeline", entityType, entityId] as const,
	slots: (tourOperatorId: string) => ["slots", tourOperatorId] as const,
	slot: (tourOperatorId: string, slotId: string) =>
		["slots", tourOperatorId, slotId] as const,
	pickupLocations: (tourOperatorId: string) =>
		["pickup-locations", tourOperatorId] as const,
	pickupLocation: (tourOperatorId: string, pickupLocationId: string) =>
		["pickup-locations", tourOperatorId, pickupLocationId] as const,
	pages: (tourOperatorId: string) => ["pages", tourOperatorId] as const,
	pageDetail: (tourOperatorId: string, pageId: string) =>
		["pages", tourOperatorId, pageId] as const,
	pageTranslations: (tourOperatorId: string, pageId: string) =>
		["pages", tourOperatorId, pageId, "translations"] as const,
	pageTranslation: (tourOperatorId: string, pageId: string, locale: string) =>
		["pages", tourOperatorId, pageId, "translations", locale] as const,
	metafieldDefinitions: (tourOperatorId: string) =>
		["metafield-definitions", tourOperatorId] as const,
	metafieldDefinition: (tourOperatorId: string, definitionId: string) =>
		["metafield-definitions", tourOperatorId, definitionId] as const,
	metafieldValues: (
		tourOperatorId: string,
		ownerType: string,
		ownerId: string,
	) => ["metafield-values", tourOperatorId, ownerType, ownerId] as const,
	media: (tourOperatorId: string) => ["media", tourOperatorId] as const,
	mediaAsset: (tourOperatorId: string, mediaId: string) =>
		["media", tourOperatorId, mediaId] as const,
	experiences: (tourOperatorId: string) =>
		["experiences", tourOperatorId] as const,
	experience: (tourOperatorId: string, experienceId: string) =>
		["experiences", tourOperatorId, experienceId] as const,
	experienceTranslations: (tourOperatorId: string, experienceId: string) =>
		["experiences", tourOperatorId, experienceId, "translations"] as const,
	experienceTranslation: (
		tourOperatorId: string,
		experienceId: string,
		locale: string,
	) =>
		[
			"experiences",
			tourOperatorId,
			experienceId,
			"translations",
			locale,
		] as const,
};
