import { z } from "zod";
import * as m from "#/paraglide/messages";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PRICE = 10_000_000_000;
const MAX_CAPACITY = 100_000;
const MAX_DEPARTURES = 500;

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

export const slotSchema = z
	.object({
		days: z.array(z.number()).min(1, m.validation_select_one_day()),
		startTime: z.string().regex(TIME, m.validation_required()),
		endTime: z.string().regex(TIME, m.validation_required()),
		validFrom: z.string().regex(ISO_DATE, m.validation_required()),
		validTo: z.string().regex(ISO_DATE, m.validation_required()),
		audiencePrices: audiencePricesSchema,
	})
	.superRefine((v, ctx) => {
		if (!ISO_DATE.test(v.validFrom) || !ISO_DATE.test(v.validTo)) return;
		if (v.validTo < v.validFrom) {
			ctx.addIssue({
				code: "custom",
				message: m.validation_window_end_before_start(),
				path: ["validTo"],
			});
			return;
		}
		const count = matchingDates(v).length;
		if (count === 0) {
			ctx.addIssue({
				code: "custom",
				message: m.validation_no_departures(),
				path: ["days"],
			});
		}
		if (count > MAX_DEPARTURES) {
			ctx.addIssue({
				code: "custom",
				message: m.validation_too_many_departures({ count: MAX_DEPARTURES }),
				path: ["validTo"],
			});
		}
	});

export type SlotFormData = z.input<typeof slotSchema>;
export type SlotFields = z.output<typeof slotSchema>;

export interface Departure {
	startAt: string;
	endAt: string;
}

export const rollsToNextDay = (startTime: string, endTime: string): boolean =>
	TIME.test(startTime) && TIME.test(endTime) && endTime <= startTime;

const parseIsoDate = (isoDate: string): Date => {
	const [y = 1970, mo = 1, d = 1] = isoDate.split("-").map(Number);
	return new Date(y, mo - 1, d);
};

const toIsoDate = (date: Date): string =>
	`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const nextDay = (isoDate: string): string => {
	const date = parseIsoDate(isoDate);
	date.setDate(date.getDate() + 1);
	return toIsoDate(date);
};

const matchingDates = (
	pattern: Pick<SlotFields, "days" | "validFrom" | "validTo">,
): string[] => {
	const days = new Set(pattern.days);
	const dates: string[] = [];
	for (
		let day = pattern.validFrom;
		day <= pattern.validTo;
		day = nextDay(day)
	) {
		if (days.has(parseIsoDate(day).getDay())) dates.push(day);
	}
	return dates;
};

export const expandDepartures = (
	fields: Omit<SlotFields, "audiencePrices">,
): Departure[] => {
	const rolls = rollsToNextDay(fields.startTime, fields.endTime);
	return matchingDates(fields).map((day) => ({
		startAt: `${day}T${fields.startTime}:00`,
		endAt: `${rolls ? nextDay(day) : day}T${fields.endTime}:00`,
	}));
};
