import { z } from "zod";
import { TRANSLATABLE_METAFIELD_TYPES } from "#/metafields";
import * as m from "#/paraglide/messages";
import type { Metaobject } from "../types";

export type TranslatableField = Metaobject["fields"][number] & {
	value: string;
};

// The backend answers 404 to a translation of a field the entry has no value
// for, so an unset field is not offered.
export const translatableFields = (entry: Metaobject): TranslatableField[] =>
	entry.fields.filter(
		(field): field is TranslatableField =>
			field.value !== null && TRANSLATABLE_METAFIELD_TYPES.includes(field.type),
	);

const MAX_LENGTH = { single_line_text: 255, multi_line_text: 5_000 } as const;

const text = (max: number) =>
	z
		.string()
		.transform((v) => v.trim())
		.pipe(z.string().max(max, m.validation_max_length({ count: max })));

// A blank value clears that field's translation; the write is a patch.
export const metaobjectTranslationSchema = (fields: TranslatableField[]) =>
	z
		.record(z.string(), z.string())
		.superRefine((values, ctx) => {
			for (const field of fields) {
				const max = MAX_LENGTH[field.type as keyof typeof MAX_LENGTH];
				const result = text(max).safeParse(values[field.key] ?? "");
				for (const issue of result.error?.issues ?? []) {
					ctx.addIssue({ ...issue, path: [field.key] });
				}
			}
		})
		.transform((values) => ({
			values: Object.fromEntries(
				fields.map((field) => [field.key, (values[field.key] ?? "").trim()]),
			),
		}));
