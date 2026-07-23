import { useInfiniteQuery } from "@tanstack/react-query";
import type { HeaderContext } from "@tanstack/react-table";
import { useEffect } from "react";
import { Spinner } from "#/components/ui/spinner";
import { authApi } from "#/lib/api";
import { AppSetFilter, type SetFilterItem } from "./AppSetFilter";

type AsyncRow = Record<string, unknown>;

interface Props<TData> {
	headerContext: HeaderContext<TData, unknown>;
	// Cursor-paginated endpoint returning { data, nextCursor } — the options are
	// derived from its rows.
	endpoint: string;
	queryKey: readonly unknown[];
	// Which field on each row is the option's value (sent as filter[field][in])
	// and its display label.
	valueKey?: string;
	labelKey?: string;
}

// The set filter with a *fetched* option list: it loads the options from an
// endpoint, then hands the deduped list to AppSetFilter (search + multi-select +
// clear/count). Loads every page so the client-side search/pick covers the whole
// set — safe for a bounded list (a roster); an unbounded list would need a
// server-searched, paginated variant instead.
export function AppAsyncSetFilter<TData>({
	headerContext,
	endpoint,
	queryKey,
	valueKey = "id",
	labelKey = "name",
}: Props<TData>) {
	const { data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useInfiniteQuery({
			queryKey: [...queryKey, "set-filter-options"],
			queryFn: async ({ pageParam }) => {
				const params = new URLSearchParams();
				if (pageParam) params.set("cursor", pageParam as string);
				const qs = params.toString();
				const res = await authApi.get<{
					data: AsyncRow[];
					nextCursor: string | null;
				}>(qs ? `${endpoint}?${qs}` : endpoint);
				return res.data;
			},
			initialPageParam: null as string | null,
			getNextPageParam: (last) => last.nextCursor,
		});

	useEffect(() => {
		if (hasNextPage && !isFetchingNextPage) fetchNextPage();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	if (isPending || hasNextPage) {
		return (
			<div className="flex justify-center py-4">
				<Spinner />
			</div>
		);
	}

	// Distinct options by value — a name/email can repeat across members.
	const seen = new Set<string>();
	const items: SetFilterItem[] = [];
	for (const row of data?.pages.flatMap((p) => p.data) ?? []) {
		const value = String(row[valueKey] ?? "");
		if (!value || seen.has(value)) continue;
		seen.add(value);
		items.push({ value, label: String(row[labelKey] ?? value) });
	}
	items.sort((a, b) => a.label.localeCompare(b.label));

	return <AppSetFilter headerContext={headerContext} items={items} />;
}
