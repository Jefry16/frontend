import { z } from "zod";
import * as m from "#/paraglide/messages";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_PRICE = 10_000_000_000;

// An empty price is 0: the backend charges nothing for an audience it is not
// told about, and 0 is how an audience that once paid becomes free again.
const price = z
	.string()
	.trim()
	.refine(
		(v) => v === "" || (Number(v) >= 0 && Number(v) < MAX_PRICE),
		m.validation_price(),
	)
	.transform((v) => (v === "" ? 0 : Number(v)));

export const pickupLocationSchema = (audienceIds: readonly string[]) =>
	z
		.object({
			name: z
				.string()
				.trim()
				.min(1, m.validation_required())
				.max(200, m.validation_max_length({ count: 200 })),
			time: z
				.string()
				.trim()
				.min(1, m.validation_required())
				.regex(TIME_RE, m.validation_time()),
			prices: z.object(
				Object.fromEntries(audienceIds.map((id) => [id, price])),
			),
		})
		.transform(({ name, time, prices }) => ({
			name,
			time,
			audiencePrices: audienceIds.map((audienceId) => ({
				audienceId,
				price: prices[audienceId] ?? 0,
			})),
		}));

export type PickupLocationFormData = z.input<
	ReturnType<typeof pickupLocationSchema>
>;
export type PickupLocationFields = z.output<
	ReturnType<typeof pickupLocationSchema>
>;
