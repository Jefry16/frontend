import {
	AppStaticTable,
	type AppStaticTableColumn,
	formatMoney,
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { useOperatorCurrency } from "#/session";

interface AudiencePriced {
	audienceId: string;
	audienceName: string;
	price: number;
}

// Every price-per-audience table opens with the audience and its price in the
// operator's currency; a caller adds what its rows know beyond that.
export const AppAudiencePriceTable = <Row extends AudiencePriced>({
	rows,
	columns = [],
}: {
	rows: Row[];
	columns?: AppStaticTableColumn<Row>[];
}) => {
	const currency = useOperatorCurrency();
	return (
		<AppStaticTable
			columns={[
				{
					id: "audience",
					header: m.audience(),
					cell: (row) => row.audienceName,
				},
				{
					id: "price",
					header: m.price(),
					cell: (row) => formatMoney(row.price, currency, getLocale()),
					numeric: true,
				},
				...columns,
			]}
			rows={rows}
			rowKey={(row) => row.audienceId}
		/>
	);
};
