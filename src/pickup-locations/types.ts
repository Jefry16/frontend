interface PickupAudiencePrice {
	audienceId: string;
	audienceName: string;
	price: number;
}

export interface PickupLocation {
	id: string;
	context: "pickup-locations";
	name: string;
	time: string;
	audiencePrices: PickupAudiencePrice[];
	createdAt: string;
}
