import { type AppStaticTableColumn, formatMoney } from "@vointika/ui";
import * as m from "#/paraglide/messages";

interface AudiencePriced {
	audienceName: string;
	price: number;
}

// The two columns every price-per-audience table opens with, so a slot's
// tiers and a pickup location's boarding prices read the same, a 0 as Free.
export const audiencePriceColumns = <Row extends AudiencePriced>(
	currency: string | null,
	locale: string,
): AppStaticTableColumn<Row>[] => [
	{ id: "audience", header: m.audience(), cell: (row) => row.audienceName },
	{
		id: "price",
		header: m.price(),
		cell: (row) =>
			row.price === 0 ? m.free() : formatMoney(row.price, currency, locale),
		numeric: true,
	},
];
