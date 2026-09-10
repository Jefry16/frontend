import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors TourOperatorAddress: address1 and city are required, the rest
// optional. There is no country here — backend V17 dropped the column, because
// timezone_id is NOT NULL and a timezone already carries its country, so an
// address country was a second copy free to disagree. Readers resolve it
// through the timezone.
//
// Optional fields stay "" rather than collapsing to null — the backend clears
// an optional column with a blank string, the same rule the rest of this
// operator's PATCH follows.
const required = (max: number) =>
	z
		.string()
		.trim()
		.min(1, m.validation_required())
		.max(max, m.validation_max_length({ count: max }));

const optional = (max: number) =>
	z
		.string()
		.trim()
		.max(max, m.validation_max_length({ count: max }));

export const addressSchema = z.object({
	address1: required(255),
	address2: optional(255),
	city: required(120),
	province: optional(120),
	zip: optional(20),
});
