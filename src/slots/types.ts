// One slot — a bookable departure (GET /tour-operators/{id}/slots). `id` +
// `context:"slots"` per the house convention. startAt/endAt are OPERATOR-LOCAL
// wall-clock datetimes ("2026-08-01T10:00:00", no zone); durationMinutes is
// derived server-side (endAt − startAt). AVAILABLE and SOLD_OUT are both
// operator-settable; CANCELLED is terminal.
export const SLOT_STATUSES = ["AVAILABLE", "SOLD_OUT", "CANCELLED"] as const;
export type SlotStatus = (typeof SLOT_STATUSES)[number];

export interface SlotAudiencePrice {
	audienceId: string;
	audienceName: string;
	price: number;
	capacity: number;
	paxPerUnit: number;
	bookedCount: number;
}

export interface Slot {
	id: string;
	context: "slots";
	experienceId: string;
	experienceName: string;
	experienceDescription: string;
	startAt: string;
	endAt: string;
	day: number;
	durationMinutes: number;
	status: SlotStatus;
	audiencePrices: SlotAudiencePrice[];
}
