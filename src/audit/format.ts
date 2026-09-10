import * as m from "#/paraglide/messages";

const ACTION_LABELS: Record<string, () => string> = {
	"tour_operator.created": m.activity_action_tour_operator_created,
	"tour_operator.locales_updated":
		m.activity_action_tour_operator_locales_updated,
	"tour_operator.logo_updated": m.activity_action_tour_operator_logo_updated,
	"tour_operator.policy_created":
		m.activity_action_tour_operator_policy_created,
	"tour_operator.policy_updated":
		m.activity_action_tour_operator_policy_updated,
	"tour_operator.policy_deleted":
		m.activity_action_tour_operator_policy_deleted,
	"tour_operator.policy_translation_updated":
		m.activity_action_tour_operator_policy_translation_updated,
	"tour_operator.policy_translation_deleted":
		m.activity_action_tour_operator_policy_translation_deleted,
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
	"category.created": m.activity_action_category_created,
	"category.updated": m.activity_action_category_updated,
	"category.deleted": m.activity_action_category_deleted,
	"category.translation_updated": m.activity_action_translation_updated,
	"category.translation_deleted": m.activity_action_translation_deleted,
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
	"metafield_definition.created":
		m.activity_action_metafield_definition_created,
	"metafield_definition.updated":
		m.activity_action_metafield_definition_updated,
	"metafield_definition.deleted":
		m.activity_action_metafield_definition_deleted,
	"metaobject_definition.created":
		m.activity_action_metaobject_definition_created,
	"metaobject_definition.updated":
		m.activity_action_metaobject_definition_updated,
	"metaobject_definition.deleted":
		m.activity_action_metaobject_definition_deleted,
	"metaobject_definition.field_added": m.activity_action_metaobject_field_added,
	"metaobject_definition.field_updated":
		m.activity_action_metaobject_field_updated,
	"metaobject_definition.field_removed":
		m.activity_action_metaobject_field_removed,
	"metaobject.created": m.activity_action_metaobject_created,
	"metaobject.updated": m.activity_action_metaobject_updated,
	"metaobject.published": m.activity_action_metaobject_published,
	"metaobject.unpublished": m.activity_action_metaobject_unpublished,
	"metaobject.deleted": m.activity_action_metaobject_deleted,
	"experience.metafield_updated": m.activity_action_metafield_updated,
	"experience.metafield_cleared": m.activity_action_metafield_cleared,
	"page.metafield_updated": m.activity_action_metafield_updated,
	"page.metafield_cleared": m.activity_action_metafield_cleared,
	"menu.created": m.activity_action_menu_created,
	"menu.renamed": m.activity_action_menu_renamed,
	"menu.items_replaced": m.activity_action_menu_items_replaced,
	"menu.deleted": m.activity_action_menu_deleted,
	"tour_operator.storefront_password_updated":
		m.activity_action_storefront_password_updated,
	"contact_message.deleted": m.activity_action_contact_message_deleted,
};

const FIELD_LABELS: Record<string, () => string> = {
	name: m.name,
	description: m.description,
	longDescription: m.long_description,
	featured: m.featured,
	mediaIds: m.media,
	thumbnailMediaId: m.thumbnail,
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
	primaryLocale: m.primary_language,
	supportedLocales: m.supported_languages,
	value: m.value,
};

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
	const local = action.includes(".")
		? action.slice(action.indexOf(".") + 1)
		: action;
	return local.replace(/_/g, " ");
};

export const formatAuditField = (field: string): string => {
	const known = FIELD_LABELS[field];
	if (known) return known();
	const spaced = field.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

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

export const ACTION_OPTIONS = Object.entries(ACTION_LABELS).map(
	([value, label]) => ({ value, label: label() }),
);

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
	CATEGORY: {
		label: m.category,
		route: {
			to: "/tour-operators/$tourOperatorId/categories/$categoryId",
			param: "categoryId",
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
	METAOBJECT_DEFINITION: {
		label: m.metaobject_definition,
		route: {
			to: "/tour-operators/$tourOperatorId/content/metaobjects/$definitionId",
			param: "definitionId",
		},
	},
	METAOBJECT: {
		label: m.metaobject,
		route: {
			to: "/tour-operators/$tourOperatorId/content/metaobjects/entries/$metaobjectId",
			param: "metaobjectId",
		},
	},
	METAFIELD_DEFINITION: {
		label: m.metafield_definition,
		route: {
			to: "/tour-operators/$tourOperatorId/content/metafields/$definitionId",
			param: "definitionId",
		},
	},
	MENU: {
		label: m.menu,
		route: {
			to: "/tour-operators/$tourOperatorId/content/menus/$menuId",
			param: "menuId",
		},
	},
	CONTACT_MESSAGE: {
		label: m.inbox_message,
		route: {
			to: "/tour-operators/$tourOperatorId/inbox/$messageId",
			param: "messageId",
		},
	},
	TOUR_OPERATOR: {
		label: m.operator_profile,
		route: { to: "/tour-operators/$tourOperatorId/settings/general" },
	},
};

export const formatEntityType = (entityType: string): string =>
	ENTITY_TYPES[entityType]?.label() ?? formatAuditValue(entityType);

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

export const ENTITY_TYPE_OPTIONS = Object.entries(ENTITY_TYPES).map(
	([value, type]) => ({ value, label: type.label() }),
);
