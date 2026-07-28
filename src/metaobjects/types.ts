import type { MetafieldTypeCode } from "#/metafields";

// Metaobjects: free-standing custom content types (size guides, FAQs, guide
// profiles). A DEFINITION is the blueprint (type slug + ordered fields from
// the metafield type catalogue); an ENTRY is one piece of content of that
// type. Managed under Content → Metaobjects.

/** One field of a definition, in position order. key/type are immutable. */
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
	/** The slug identifier — immutable after create, unique per operator. */
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

/** The detail read: every definition field, value null when unset. */
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
