export interface OrderListItem {
	id: string;
	context: "orders";
	customerName: string;
	customerEmail: string;
	totalAmount: number;
	currency: string;
	placedAt: string;
}

interface OrderCustomer {
	name: string;
	email: string;
	phone: string | null;
	detail: string | null;
}

export interface BookingLine {
	id: string;
	audienceId: string;
	audienceName: string;
	quantity: number;
	unitPrice: number;
	pickupUnitPrice: number;
}

interface BookingPickup {
	pickupLocationId: string;
	name: string;
	time: string;
}

export type BookingStatus = "CONFIRMED";

export interface Booking {
	id: string;
	slotId: string;
	experienceId: string;
	experienceName: string;
	startAt: string;
	endAt: string;
	pickup: BookingPickup | null;
	partySize: number;
	totalAmount: number;
	status: BookingStatus;
	lines: BookingLine[];
}

export interface Order {
	id: string;
	context: "orders";
	checkoutSessionId: string;
	paymentId: string;
	customer: OrderCustomer;
	totalAmount: number;
	currency: string;
	placedAt: string;
	bookings: Booking[];
}

export interface BookingManifestItem extends Booking {
	context: "bookings";
	orderId: string;
	customer: OrderCustomer;
}
