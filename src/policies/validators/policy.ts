import { z } from "zod";
import * as m from "#/paraglide/messages";
import { POLICY_TYPES } from "../types";

// Caps mirror the backend value objects: PolicyTitle 200, PolicyBody 256 KiB.
// Both are required — a policy exists or it does not, so neither may be blank.
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

/**
 * One schema for both modes. The create/update difference is which fields are
 * SENT, not which are valid — the form always holds a type (seeded from the
 * record when editing) and the hook's payload is what leaves it out of the PUT.
 */
export const policySchema = z.object({
	type: z.enum(POLICY_TYPES),
	title,
	body,
});
