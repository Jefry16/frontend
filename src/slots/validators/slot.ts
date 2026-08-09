import { z } from "zod";
import * as m from "#/paraglide/messages";

// Mirrors the backend guards; days are 0–6 Sunday-first. Pricing rows carry a
// client-only `_key` for React list identity, and validate as a group — issues
// attach to the array field, not to the rows' own inputs.

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PRICE = 10_000_000_000;
const MAX_CAPACITY = 100_000;

export interface AudiencePriceRow {
	_key: string;
	audienceId: string;
	price: string;
	capacity: string;
}

export const emptyPriceRow = (): AudiencePriceRow => ({
	_key: crypto.randomUUID(),
	audienceId: "",
	price: "",
	capacity: "",
});

const audiencePricesSchema = z
	.array(
		z.object({
			_key: z.string(),
			audienceId: z.string(),
			price: z.string(),
			capacity: z.string(),
		}),
	)
	.min(1, m.validation_required())
	.superRefine((rows, ctx) => {
		const complete = (r: AudiencePriceRow) =>
			r.audienceId !== "" &&
			r.price !== "" &&
			Number(r.price) < MAX_PRICE &&
			r.capacity !== "" &&
			Number(r.capacity) >= 1 &&
			Number(r.capacity) <= MAX_CAPACITY;
		if (!rows.every(complete)) {
			ctx.addIssue({
				code: "custom",
				message: m.validation_pricing_row_incomplete(),
			});
		}
		if (new Set(rows.map((r) => r.audienceId)).size !== rows.length) {
			ctx.addIssue({
				code: "custom",
				message: m.validation_duplicate_audience(),
			});
		}
	})
	.transform((rows) =>
		rows.map((r) => ({
			audienceId: r.audienceId,
			price: Number(r.price),
			capacity: Number(r.capacity),
		})),
	);

const sharedFields = {
	startTime: z.string().regex(TIME, m.validation_required()),
	endTime: z.string().regex(TIME, m.validation_required()),
	audiencePrices: audiencePricesSchema,
};

export const recurringSlotSchema = z
	.object({
		days: z.array(z.number()).min(1, m.validation_select_one_day()),
		validFrom: z.string().regex(ISO_DATE, m.validation_required()),
		validTo: z.string().regex(ISO_DATE, m.validation_required()),
		...sharedFields,
	})
	.refine((v) => v.validTo >= v.validFrom, {
		message: m.validation_window_end_before_start(),
		path: ["validTo"],
	});

export const singleSlotSchema = z.object({
	date: z.string().regex(ISO_DATE, m.validation_required()),
	...sharedFields,
});

export type RecurringSlotFormData = z.input<typeof recurringSlotSchema>;
export type RecurringSlotFields = z.output<typeof recurringSlotSchema>;
export type SingleSlotFormData = z.input<typeof singleSlotSchema>;
export type SingleSlotFields = z.output<typeof singleSlotSchema>;

/** "18:00" + 150 min → "20:30", wrapping past midnight. */
export const addMinutes = (time: string, minutes: number): string => {
	if (!TIME.test(time)) return "";
	const [h = 0, mn = 0] = time.split(":").map(Number);
	const total = (h * 60 + mn + minutes) % (24 * 60);
	return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

/** End at or before start means the departure ends the NEXT day. */
export const rollsToNextDay = (startTime: string, endTime: string): boolean =>
	TIME.test(startTime) && TIME.test(endTime) && endTime <= startTime;

/** Calendar-correct via Date, so month ends roll properly. */
const nextDay = (isoDate: string): string => {
	const [y = 1970, mo = 1, d = 1] = isoDate.split("-").map(Number);
	const date = new Date(y, mo - 1, d + 1);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

/** Rolls the end date across midnight when needed. */
export const composeStartEnd = (
	fields: SingleSlotFields,
): { startAt: string; endAt: string } => ({
	startAt: `${fields.date}T${fields.startTime}:00`,
	endAt: `${
		rollsToNextDay(fields.startTime, fields.endTime)
			? nextDay(fields.date)
			: fields.date
	}T${fields.endTime}:00`,
});
