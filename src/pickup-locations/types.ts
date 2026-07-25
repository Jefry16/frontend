// One pickup location — an operator's meeting point (GET /tour-operators/{id}/
// pickup-locations). `id` + `context:"pickup-locations"` per the house
// convention. `time` is the operator-local meeting time-of-day ("09:30:00").
export interface PickupLocation {
	id: string;
	context: "pickup-locations";
	name: string;
	time: string;
	createdAt: string;
}
