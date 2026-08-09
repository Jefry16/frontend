import type { MetafieldTypeCode } from "#/metafields";

// A DEFINITION is the blueprint; an ENTRY is one piece of content of that type.

/** Position-ordered. key and type are immutable. */
export interface MetaobjectField {
	key: string;
	type: MetafieldTypeCode;
	name: string;
}

export interface MetaobjectDefinitionListItem {
	id: string;
	context: "metaobject-definitions";
	type: string;
	name: string;
	createdAt: string;
}

export interface MetaobjectDefinition {
	id: string;
	context: "metaobject-definitions";
	/** Immutable after create, unique per operator. */
	type: string;
	name: string;
	description: string | null;
	fields: MetaobjectField[];
	createdAt: string;
	updatedAt: string;
}

export interface MetaobjectListItem {
	id: string;
	context: "metaobjects";
	definitionId: string;
	handle: string;
	name: string;
	published: boolean;
	createdAt: string;
}

/** Every definition field; value is null when unset. */
export interface Metaobject {
	id: string;
	context: "metaobjects";
	definitionId: string;
	handle: string;
	name: string;
	published: boolean;
	fields: (MetaobjectField & { value: string | null })[];
	createdAt: string;
	updatedAt: string;
}
