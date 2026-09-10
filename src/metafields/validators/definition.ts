import { z } from "zod";
import * as m from "#/paraglide/messages";
import { METAFIELD_OWNER_TYPES } from "../types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugField = z
	.string()
	.trim()
	.min(1, m.validation_required())
	.max(64, m.validation_max_length({ count: 64 }))
	.regex(SLUG, m.validation_slug());

export const definitionSchema = z
	.object({
		ownerType: z.enum(METAFIELD_OWNER_TYPES, m.validation_required()),
		namespace: slugField,
		key: slugField,
		type: z.enum(
			[
				"single_line_text",
				"multi_line_text",
				"number_integer",
				"number_decimal",
				"boolean",
				"date",
				"url",
				"json",
				"metaobject_reference",
			],
			m.validation_required(),
		),
		metaobjectDefinitionId: z.string(),
		name: z
			.string()
			.trim()
			.min(1, m.validation_required())
			.max(120, m.validation_max_length({ count: 120 })),
		description: z
			.string()
			.trim()
			.max(500, m.validation_max_length({ count: 500 })),
	})
	.superRefine((value, ctx) => {
		if (
			value.type === "metaobject_reference" &&
			!value.metaobjectDefinitionId
		) {
			ctx.addIssue({
				code: "custom",
				path: ["metaobjectDefinitionId"],
				message: m.validation_required(),
			});
		}
	});

export type DefinitionFormData = z.input<typeof definitionSchema>;
export type DefinitionFields = z.output<typeof definitionSchema>;

export const deriveKey = (name: string): string =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 64);
