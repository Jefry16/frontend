import { z } from "zod";
import * as m from "#/paraglide/messages";
import { POLICY_TYPES } from "../types";

const TITLE_MAX = 200;
const BODY_MAX = 262_144;

const title = z
	.string()
	.transform((v) => v.trim())
	.pipe(
		z
			.string()
			.min(1, m.validation_required())
			.max(TITLE_MAX, m.validation_max_length({ count: TITLE_MAX })),
	);

const body = z
	.string()
	.transform((v) => v.trim())
	.pipe(
		z
			.string()
			.min(1, m.validation_required())
			.max(BODY_MAX, m.validation_max_length({ count: BODY_MAX })),
	);

export const policySchema = z.object({
	type: z.enum(POLICY_TYPES),
	title,
	body,
});
