import * as m from "#/paraglide/messages";

// Action → human label ("<actor> <label>"). Keys are the backend's
// dot-namespaced action strings; an unknown action falls back to a humanized
// form so a new backend action renders sensibly before this map learns it.
const ACTION_LABELS: Record<string, () => string> = {
	"tour_operator.created": m.activity_action_tour_operator_created,
	"tour_operator.locales_updated":
		m.activity_action_tour_operator_locales_updated,
	"tour_operator.logo_updated": m.activity_action_tour_operator_logo_updated,
	"member.role_changed": m.activity_action_member_role_changed,
	"member.removed": m.activity_action_member_removed,
	"ownership.transferred": m.activity_action_ownership_transferred,
	"member.invited": m.activity_action_member_invited,
	"invitation.resent": m.activity_action_invitation_resent,
	"invitation.revoked": m.activity_action_invitation_revoked,
	"invitation.accepted": m.activity_action_invitation_accepted,
	"media.uploaded": m.activity_action_media_uploaded,
	"media.deleted": m.activity_action_media_deleted,
	"experience.created": m.activity_action_experience_created,
	"experience.updated": m.activity_action_experience_updated,
	"experience.published": m.activity_action_experience_published,
	"experience.unpublished": m.activity_action_experience_unpublished,
	"experience.translation_updated": m.activity_action_translation_updated,
	"experience.translation_deleted": m.activity_action_translation_deleted,
	"experience.slots_created": m.activity_action_experience_slots_created,
	"slot.created": m.activity_action_slot_created,
	"slot.cancelled": m.activity_action_slot_cancelled,
	"slot.updated": m.activity_action_slot_updated,
	"audience.created": m.activity_action_audience_created,
	"audience.updated": m.activity_action_audience_updated,
	"audience.translation_updated": m.activity_action_translation_updated,
	"audience.translation_deleted": m.activity_action_translation_deleted,
	"page.created": m.activity_action_page_created,
	"page.updated": m.activity_action_page_updated,
	"page.published": m.activity_action_page_published,
	"page.unpublished": m.activity_action_page_unpublished,
	"page.renamed": m.activity_action_page_renamed,
	"page.deleted": m.activity_action_page_deleted,
	"page.translation_updated": m.activity_action_translation_updated,
	"page.translation_deleted": m.activity_action_translation_deleted,
	"pickup_location.created": m.activity_action_pickup_location_created,
	"pickup_location.updated": m.activity_action_pickup_location_updated,
	"pickup_location.deleted": m.activity_action_pickup_location_deleted,
};

// Field → label for the `{field, from, to}` diff rows. Reuses the form labels
// where one exists; anything unmapped falls back to spaced camelCase.
const FIELD_LABELS: Record<string, () => string> = {
	name: m.name,
	description: m.description,
	longDescription: m.long_description,
	featured: m.featured,
	tags: m.tags,
	highlights: m.highlights,
	included: m.whats_included,
	notIncluded: m.not_included,
	mediaIds: m.media,
	thumbnailMediaId: m.thumbnail,
	durationMinutes: m.duration_minutes,
	bookingCutoffHours: m.booking_cutoff_hours,
	published: m.published,
	status: m.status,
	capacity: m.capacity,
	paxPerUnit: m.pax_per_unit,
	time: m.time,
	role: m.role,
	logoMediaId: m.logo,
	handle: m.handle,
	seoTitle: m.seo_title,
	seoDescription: m.seo_description,
	templateSuffix: m.template_suffix,
	primaryLocale: m.primary_language,
	supportedLocales: m.supported_languages,
};

/** The actor line: the frozen display name, or the per-type generic label. */
export const formatAuditActor = (entry: {
	actorType: "USER" | "SYSTEM";
	actorName: string | null;
}): string => {
	if (entry.actorType === "SYSTEM") return m.actor_system();
	return entry.actorName ?? m.actor_member();
};

export const formatAuditAction = (action: string): string => {
	const known = ACTION_LABELS[action];
	if (known) return known();
	// "slot.rescheduled" → "rescheduled"; "foo.bar_baz" → "bar baz".
	const local = action.includes(".")
		? action.slice(action.indexOf(".") + 1)
		: action;
	return local.replace(/_/g, " ");
};

export const formatAuditField = (field: string): string => {
	const known = FIELD_LABELS[field];
	if (known) return known();
	// camelCase → "Camel case".
	const spaced = field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/**
 * A diff/details value as display text: null/undefined → an em-dash ("set from
 * nothing" / "cleared"); an ENUM_NAME → title case (SOLD_OUT → "Sold out");
 * arrays joined; anything else stringified.
 */
export const formatAuditValue = (value: unknown): string => {
	if (value === null || value === undefined) return "—";
	if (Array.isArray(value)) {
		return value.length ? value.map(formatAuditValue).join(", ") : "—";
	}
	if (typeof value === "string" && /^[A-Z][A-Z0-9_]*$/.test(value)) {
		const spaced = value.toLowerCase().replace(/_/g, " ");
		return spaced.charAt(0).toUpperCase() + spaced.slice(1);
	}
	return String(value);
};

/** Set-filter options for the action column — the known action catalog. */
export const ACTION_OPTIONS = Object.entries(ACTION_LABELS).map(
	([value, label]) => ({ value, label: label() }),
);

// entityType → its localized label + (where a detail page exists) the route the
// entity cell links to. TOUR_OPERATOR points at the General settings page.
interface EntityRoute {
	to: string;
	param?: string;
}
const ENTITY_TYPES: Record<
	string,
	{ label: () => string; route?: EntityRoute }
> = {
	EXPERIENCE: {
		label: m.experience,
		route: {
			to: "/tour-operators/$tourOperatorId/experiences/$experienceId",
			param: "experienceId",
		},
	},
	SLOT: {
		label: m.availability,
		route: {
			to: "/tour-operators/$tourOperatorId/availability/$slotId",
			param: "slotId",
		},
	},
	AUDIENCE: {
		label: m.audience,
		route: {
			to: "/tour-operators/$tourOperatorId/audiences/$audienceId",
			param: "audienceId",
		},
	},
	PICKUP_LOCATION: {
		label: m.pickup_location,
		route: {
			to: "/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId",
			param: "pickupLocationId",
		},
	},
	MEDIA: {
		label: m.media,
		route: {
			to: "/tour-operators/$tourOperatorId/content/media/$mediaId",
			param: "mediaId",
		},
	},
	PAGE: {
		label: m.page,
		route: {
			to: "/tour-operators/$tourOperatorId/content/pages/$pageId",
			param: "pageId",
		},
	},
	MEMBER: {
		label: m.member,
		route: {
			to: "/tour-operators/$tourOperatorId/settings/members/$userId",
			param: "userId",
		},
	},
	INVITATION: {
		label: m.invitation,
		route: {
			to: "/tour-operators/$tourOperatorId/settings/invitations/$invitationId",
			param: "invitationId",
		},
	},
	TOUR_OPERATOR: {
		label: m.operator_profile,
		route: { to: "/tour-operators/$tourOperatorId/settings/general" },
	},
};

export const formatEntityType = (entityType: string): string =>
	ENTITY_TYPES[entityType]?.label() ?? formatAuditValue(entityType);

/** The entity cell's link target, or null when no detail page exists. */
export const entityRoute = (
	entityType: string,
	tourOperatorId: string,
	entityId: string,
): { to: string; params: Record<string, string> } | null => {
	const route = ENTITY_TYPES[entityType]?.route;
	if (!route) return null;
	const params: Record<string, string> = { tourOperatorId };
	if (route.param) params[route.param] = entityId;
	return { to: route.to, params };
};

/** Set-filter options for the entity column — the audited entity types. */
export const ENTITY_TYPE_OPTIONS = Object.entries(ENTITY_TYPES).map(
	([value, type]) => ({ value, label: type.label() }),
);
