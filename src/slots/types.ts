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
