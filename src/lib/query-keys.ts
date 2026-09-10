// Central registry of React Query keys. Grows one entry per feature — each new
// module adds the keys its queries use here, so invalidations stay consistent
// and collisions are visible in one place.
export const queryKeys = {
	authProfile: ["auth", "profile"] as const,
	timezones: ["timezones"] as const,
	currencies: ["currencies"] as const,
	languages: ["languages"] as const,
	uiLanguages: ["ui-languages"] as const,
	operatorDetails: (tourOperatorId: string) =>
		["operator-details", tourOperatorId] as const,
	operatorTranslations: (tourOperatorId: string) =>
		["operator-translations", tourOperatorId] as const,
	operatorTranslation: (tourOperatorId: string, locale: string) =>
		["operator-translations", tourOperatorId, locale] as const,
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
	contactMessages: (tourOperatorId: string) =>
		["contact-messages", tourOperatorId] as const,
	contactMessage: (tourOperatorId: string, messageId: string) =>
		["contact-messages", tourOperatorId, messageId] as const,
	menus: (tourOperatorId: string) => ["menus", tourOperatorId] as const,
	menu: (tourOperatorId: string, menuId: string) =>
		["menus", tourOperatorId, menuId] as const,
	pages: (tourOperatorId: string) => ["pages", tourOperatorId] as const,
	pageDetail: (tourOperatorId: string, pageId: string) =>
		["pages", tourOperatorId, pageId] as const,
	pageTranslations: (tourOperatorId: string, pageId: string) =>
		["pages", tourOperatorId, pageId, "translations"] as const,
	pageTranslation: (tourOperatorId: string, pageId: string, locale: string) =>
		["pages", tourOperatorId, pageId, "translations", locale] as const,
	policies: (tourOperatorId: string) => ["policies", tourOperatorId] as const,
	policy: (tourOperatorId: string, policyId: string) =>
		["policies", tourOperatorId, policyId] as const,
	policyTranslations: (tourOperatorId: string, policyId: string) =>
		["policies", tourOperatorId, policyId, "translations"] as const,
	metafieldDefinitions: (tourOperatorId: string) =>
		["metafield-definitions", tourOperatorId] as const,
	metafieldDefinition: (tourOperatorId: string, definitionId: string) =>
		["metafield-definitions", tourOperatorId, definitionId] as const,
	metaobjectDefinitions: (tourOperatorId: string) =>
		["metaobject-definitions", tourOperatorId] as const,
	metaobjectDefinition: (tourOperatorId: string, definitionId: string) =>
		["metaobject-definitions", tourOperatorId, definitionId] as const,
	metaobjects: (tourOperatorId: string) =>
		["metaobjects", tourOperatorId] as const,
	metaobject: (tourOperatorId: string, metaobjectId: string) =>
		["metaobjects", tourOperatorId, metaobjectId] as const,
	metafieldValues: (
		tourOperatorId: string,
		ownerType: string,
		ownerId: string,
	) => ["metafield-values", tourOperatorId, ownerType, ownerId] as const,
	metafieldTranslationLocales: (
		tourOperatorId: string,
		ownerType: string,
		ownerId: string,
	) =>
		[
			"metafield-values",
			tourOperatorId,
			ownerType,
			ownerId,
			"translations",
		] as const,
	metafieldTranslation: (
		tourOperatorId: string,
		ownerType: string,
		ownerId: string,
		locale: string,
	) =>
		[
			"metafield-values",
			tourOperatorId,
			ownerType,
			ownerId,
			"translations",
			locale,
		] as const,
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
	categories: (tourOperatorId: string) =>
		["categories", tourOperatorId] as const,
	category: (tourOperatorId: string, categoryId: string) =>
		["categories", tourOperatorId, categoryId] as const,
	categoryTranslations: (tourOperatorId: string, categoryId: string) =>
		["categories", tourOperatorId, categoryId, "translations"] as const,
};
