import type { MetafieldTypeCode } from "#/metafields";

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
