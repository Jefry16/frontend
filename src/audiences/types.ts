// One audience — an operator's pax pricing tier (GET /tour-operators/{id}/audiences).
// `id` + `context:"audiences"` per the house convention. `paxPerUnit` is how many
// people one unit covers (1 for per-person tiers, >1 for group/package tiers).
export interface Audience {
	id: string;
	context: "audiences";
	name: string;
	paxPerUnit: number;
	createdAt: string;
}
