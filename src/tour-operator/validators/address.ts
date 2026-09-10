import { z } from "zod";
import * as m from "#/paraglide/messages";

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

// No country: the backend dropped the column, because a timezone already
// carries one and the address copy was free to disagree with it.
export const addressSchema = z.object({
	address1: required(255),
	address2: optional(255),
	city: required(120),
	province: optional(120),
	zip: optional(20),
});
