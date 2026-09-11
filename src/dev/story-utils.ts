import { QueryClient } from "@tanstack/react-query";
import { allPagesKey } from "#/hooks/use-all-pages";
import { tableKey } from "#/shared/components/useDataTable";

export const storyQueryClient = (
	seed?: (qc: QueryClient) => void,
): QueryClient => {
	const qc = new QueryClient({
		defaultOptions: {
			queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
		},
	});
	seed?.(qc);
	return qc;
};

export const listPage = <T>(data: T[]) => ({
	pages: [{ data, nextCursor: null }],
	pageParams: [null] as (string | null)[],
});

export const seedAllPages = <T>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	endpoint: string,
	rows: T[],
) => qc.setQueryData(allPagesKey(queryKey, endpoint), rows);

export const seedTable = <T>(
	qc: QueryClient,
	queryKey: readonly unknown[],
	endpoint: string,
	rows: T[],
	baseParams?: Record<string, string>,
) =>
	qc.setQueryData(
		tableKey(queryKey, endpoint, [], [], baseParams),
		listPage(rows),
	);
