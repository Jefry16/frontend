// One category — an operator's experience grouping (GET /tour-operators/{id}/categories).
// `id` + `context:"categories"` per the house convention. `handle` is the storefront
// address: derived from the name at create, and immutable from then on.
export interface Category {
	id: string;
	context: "categories";
	name: string;
	handle: string;
	createdAt: string;
}
