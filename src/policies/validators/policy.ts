import { z } from "zod";
import * as m from "#/paraglide/messages";
import { POLICY_TYPES } from "../types";

// Caps mirror the backend value objects. Both are required: a policy exists or
// it does not.
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

// Raw HTML — trimmed only, never reshaped.
const body = z
	.string()
	.transform((v) => v.trim())
	.pipe(
		z
			.string()
			.min(1, m.validation_required())
			.max(BODY_MAX, m.validation_max_length({ count: BODY_MAX })),
	);

// One schema for both modes: the create/update difference is which fields are
// SENT, not which are valid.
export const policySchema = z.object({
	type: z.enum(POLICY_TYPES),
	title,
	body,
});
