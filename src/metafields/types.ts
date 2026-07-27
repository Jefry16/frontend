// The metafield context: operator-defined custom-data fields on experiences
// and pages. Definitions (the catalogue, managed in Settings → Custom data)
// carry the identity + type; values live on the owning resource.

/** Wire code for the owning resource kind (payloads/responses). */
export type MetafieldOwnerTypeCode = "experience" | "page";

/** The v1 type catalogue's wire codes. */
export type MetafieldTypeCode =
	| "single_line_text"
	| "multi_line_text"
	| "number_integer"
	| "number_decimal"
	| "boolean"
	| "date"
	| "url"
	| "json";

/** A list row (no description — that lives on the detail). */
export interface MetafieldDefinitionListItem {
	id: string;
	context: "metafield-definitions";
	ownerType: MetafieldOwnerTypeCode;
	namespace: string;
	key: string;
	type: MetafieldTypeCode;
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
	name: string;
	description: string | null;
	createdAt: string;
	updatedAt: string;
}

/** One stored value + its definition's identity (per-resource read). */
export interface MetafieldValue {
	namespace: string;
	key: string;
	type: MetafieldTypeCode;
	name: string;
	value: string;
	updatedAt: string;
}
