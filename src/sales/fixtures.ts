import type { AuthUser } from "#/auth";
import type { BookingManifestItem } from "./types";

export const bookingInUsd: BookingManifestItem = {
	id: "bk-1",
	position: 1,
	reference: "#1001-1",
	context: "bookings",
	orderId: "ord-1",
	currency: "USD",
	customer: {
		name: "Ada",
		email: "ada@example.com",
		phone: null,
		detail: null,
	},
	slotId: "slot-1",
	experienceId: "exp-1",
	experienceName: "Buggies",
	startAt: "2026-10-09T09:00:00",
	endAt: "2026-10-09T13:00:00",
	pickup: null,
	partySize: 2,
	totalPrice: 338,
	status: "CONFIRMED",
	cancellation: null,
	lines: [
		{
			id: "ln-1",
			audienceId: "a",
			audienceName: "Adult",
			quantity: 2,
			unitPrice: 169,
			pickupUnitPrice: 0,
		},
	],
};

export const operatorInEur: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada",
	avatarUrl: null,
	language: "en",
	tourOperators: [
		{
			id: "op-1",
			name: "Scape Park",
			logoUrl: null,
			timezone: "America/Santo_Domingo",
			currency: "EUR",
			isDefault: true,
			role: "OWNER",
		},
	],
};
