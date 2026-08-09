// A definition carries the identity and type; values live on the owning resource.

/** Wire code, verbatim in payloads and responses. */
export type MetafieldOwnerTypeCode = "experience" | "page";

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
