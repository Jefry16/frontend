import * as m from "#/paraglide/messages";
import type { MetafieldOwnerTypeCode, MetafieldTypeCode } from "./types";

export const ownerTypeLabel = (code: MetafieldOwnerTypeCode): string =>
	code === "experience" ? m.experiences() : m.pages();

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

export const typeLabel = (code: MetafieldTypeCode): string =>
	TYPE_LABELS[code]();

export const TYPE_CODES = Object.keys(TYPE_LABELS) as MetafieldTypeCode[];

// Set filters speak the backend enum NAMES (shared coercion is name-based)
// while payloads/responses use the lowercase codes — the option `value` is the
// name, derived from the code.
const filterValue = (code: string) => code.toUpperCase();

export const OWNER_TYPE_FILTER_OPTIONS = (["experience", "page"] as const).map(
	(code) => ({ value: filterValue(code), label: ownerTypeLabel(code) }),
);

export const TYPE_FILTER_OPTIONS = TYPE_CODES.map((code) => ({
	value: filterValue(code),
	label: TYPE_LABELS[code](),
}));

// Barrel-facing aliases (the metaobjects module builds its dynamic entry
// forms from the same catalogue).
export const metafieldTypeLabel = typeLabel;
export const METAFIELD_TYPE_CODES = TYPE_CODES;

// Metaobject FIELDS can't be references (no nested metaobject→metaobject in
// v1 — the backend 422s it), so their type selects use this subset.
export const METAOBJECT_FIELD_TYPE_CODES = TYPE_CODES.filter(
	(code) => code !== "metaobject_reference",
);
