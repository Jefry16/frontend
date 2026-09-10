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

export interface MetafieldDefinitionListItem {
	id: string;
	context: "metafield-definitions";
	ownerType: MetafieldOwnerTypeCode;
	namespace: string;
	key: string;
	type: MetafieldTypeCode;
	metaobjectDefinitionId: string | null;
	name: string;
	createdAt: string;
}

export interface MetafieldDefinition {
	id: string;
	context: "metafield-definitions";
	ownerType: MetafieldOwnerTypeCode;
	namespace: string;
	key: string;
	type: MetafieldTypeCode;
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
