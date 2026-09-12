import * as m from "#/paraglide/messages";
import {
	METAFIELD_OWNER_TYPES,
	type MetafieldOwnerTypeCode,
	type MetafieldTypeCode,
} from "./types";

const OWNER_TYPE_LABELS: Record<MetafieldOwnerTypeCode, () => string> = {
	experience: m.experiences,
	page: m.pages,
	tour_operator: m.metafield_owner_tour_operator,
};

export const ownerTypeLabel = (code: MetafieldOwnerTypeCode): string =>
	OWNER_TYPE_LABELS[code]();

export const OWNER_TYPE_OPTIONS = METAFIELD_OWNER_TYPES.map((code) => ({
	value: code,
	label: ownerTypeLabel(code),
}));

const TYPE_LABELS: Record<MetafieldTypeCode, () => string> = {
	single_line_text: m.metafield_type_single_line_text,
	multi_line_text: m.metafield_type_multi_line_text,
	number_integer: m.metafield_type_number_integer,
	number_decimal: m.metafield_type_number_decimal,
	boolean: m.metafield_type_boolean,
	date: m.metafield_type_date,
	url: m.metafield_type_url,
	json: m.metafield_type_json,
	metaobject_reference: m.metafield_type_metaobject_reference,
};

export const metafieldTypeLabel = (code: MetafieldTypeCode): string =>
	TYPE_LABELS[code]();

export const METAFIELD_TYPE_CODES = Object.keys(
	TYPE_LABELS,
) as MetafieldTypeCode[];

const filterValue = (code: string) => code.toUpperCase();

export const OWNER_TYPE_FILTER_OPTIONS = METAFIELD_OWNER_TYPES.map((code) => ({
	value: filterValue(code),
	label: ownerTypeLabel(code),
}));

export const TYPE_FILTER_OPTIONS = METAFIELD_TYPE_CODES.map((code) => ({
	value: filterValue(code),
	label: TYPE_LABELS[code](),
}));

export const METAOBJECT_FIELD_TYPE_CODES = METAFIELD_TYPE_CODES.filter(
	(code) => code !== "metaobject_reference",
);
