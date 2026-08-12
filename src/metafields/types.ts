// A definition carries the identity and type; values live on the owning resource.

/** Wire code, verbatim in payloads and responses. */
/**
 * The owner kinds a metafield can hang off, in the order the create form offers
 * them. ONE source: the union is derived, the validator's enum reads this array,
 * and format.ts keys its label record by it — so adding an owner type here makes
 * every place that must follow fail to compile or fail a test.
 */
export const METAFIELD_OWNER_TYPES = [
	"experience",
	"page",
	"tour_operator",
] as const;

export type MetafieldOwnerTypeCode = (typeof METAFIELD_OWNER_TYPES)[number];

export type MetafieldTypeCode =
	| "single_line_text"
	| "multi_line_text"
	| "number_integer"
	| "number_decimal"
	| "boolean"
	| "date"
	| "url"
	| "json"
	| "metaobject_reference";

/** A list row; the description lives on the detail. */
export interface MetafieldDefinitionListItem {
	id: string;
	context: "metafield-definitions";
	ownerType: MetafieldOwnerTypeCode;
	namespace: string;
	key: string;
	type: MetafieldTypeCode;
	/** The pinned metaobject type (metaobject_reference only), else null. */
	metaobjectDefinitionId: string | null;
	name: string;
	createdAt: string;
}

export interface MetafieldDefinition {
	id: string;
	context: "metafield-definitions";
	/** Immutable after create, like namespace/key/type. */
	ownerType: MetafieldOwnerTypeCode;
	namespace: string;
	key: string;
	type: MetafieldTypeCode;
	/** The pinned metaobject type (metaobject_reference only), else null. */
	metaobjectDefinitionId: string | null;
	name: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface MetafieldValue {
	namespace: string;
	key: string;
	type: MetafieldTypeCode;
	name: string;
	value: string;
	updatedAt: string;
}
