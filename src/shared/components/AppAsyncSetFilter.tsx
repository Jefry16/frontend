import type { HeaderContext } from "@tanstack/react-table";
import {
	AppLoadingBlock,
	AppSetFilter,
	type SetFilterItem,
} from "@vointika/ui";
import { useAllPages } from "#/hooks/use-all-pages";
import { AppQueryState } from "./AppQueryState";

type AsyncRow = Record<string, unknown>;

const readPath = (row: AsyncRow, path: string): unknown =>
	path
		.split(".")
		.reduce<unknown>(
			(acc, key) =>
				acc && typeof acc === "object"
					? (acc as Record<string, unknown>)[key]
					: undefined,
			row,
		);

interface Props<TData> {
	headerContext: HeaderContext<TData, unknown>;
	endpoint: string;
	queryKey: readonly unknown[];
	valueKey?: string;
	labelKey?: string;
}

export function AppAsyncSetFilter<TData>({
	headerContext,
	endpoint,
	queryKey,
	valueKey = "id",
	labelKey = "name",
}: Props<TData>) {
	const options = useAllPages<AsyncRow>(queryKey, endpoint);

	return (
		<AppQueryState
			query={options}
			loading={<AppLoadingBlock className="py-4" />}
		>
			{(rows) => {
				const seen = new Set<string>();
				const items: SetFilterItem[] = [];
				for (const row of rows) {
					const value = String(readPath(row, valueKey) ?? "");
					if (!value || seen.has(value)) continue;
					seen.add(value);
					items.push({
						value,
						label: String(readPath(row, labelKey) ?? value),
					});
				}
				items.sort((a, b) => a.label.localeCompare(b.label));

				return <AppSetFilter headerContext={headerContext} items={items} />;
			}}
		</AppQueryState>
	);
}
