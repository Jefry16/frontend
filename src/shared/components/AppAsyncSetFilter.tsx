import { useInfiniteQuery } from "@tanstack/react-query";
import type { HeaderContext } from "@tanstack/react-table";
import { useEffect } from "react";
import { Spinner } from "#/components/ui/spinner";
import { authApi } from "#/lib/api";
import { AppSetFilter, type SetFilterItem } from "./AppSetFilter";

type AsyncRow = Record<string, unknown>;

// Dot-path read, e.g. "invitedBy.name".
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
	// Cursor-paginated; the options are derived from its rows.
	endpoint: string;
	queryKey: readonly unknown[];
	// Dot-paths reach nested fields ("invitedBy.name").
	valueKey?: string;
	labelKey?: string;
}

// Loads EVERY page, so the client-side search covers the whole set. Safe for a
// bounded list like a roster; an unbounded one needs a server-searched variant.
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

	// A name or email can repeat across members.
	const seen = new Set<string>();
	const items: SetFilterItem[] = [];
	for (const row of data?.pages.flatMap((p) => p.data) ?? []) {
		const value = String(readPath(row, valueKey) ?? "");
		if (!value || seen.has(value)) continue;
		seen.add(value);
		items.push({ value, label: String(readPath(row, labelKey) ?? value) });
	}
	items.sort((a, b) => a.label.localeCompare(b.label));

	return <AppSetFilter headerContext={headerContext} items={items} />;
}
