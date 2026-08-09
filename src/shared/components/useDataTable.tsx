import { useInfiniteQuery } from "@tanstack/react-query";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type FilterFn,
	getCoreRowModel,
	type RowData,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { authApi } from "#/lib/api";

declare module "@tanstack/react-table" {
	// For when the column id is not the API's sort field name. Filters always
	// send the column id; no column has needed otherwise.
	interface ColumnMeta<TData extends RowData, TValue> {
		sortField?: string;
		// Right-align + tabular figures for numeric columns so digits line up.
		align?: "right";
	}
}

type FieldMap = Record<string, { sortField?: string }>;

// Server does the sorting/filtering/paging — the table's own filter fns are no-ops.
const passFilterFn: FilterFn<unknown> = () => true;

// The shared cursor-page envelope every list endpoint returns.
interface CursorResponse<TData> {
	data: TData[];
	nextCursor: string | null;
}

interface UseDataTableProps<TData> {
	columns: ColumnDef<TData, unknown>[];
	endpoint: string;
	queryKey: readonly unknown[];
	baseParams?: Record<string, string>;
}

// Translates the table's sort/filter state into the backend's query grammar.
// AppDataTable is the rendered shell over this.
export function useDataTable<TData extends { id: string }>({
	columns,
	endpoint,
	queryKey,
	baseParams,
}: UseDataTableProps<TData>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const fieldMap = useMemo<FieldMap>(() => {
		const map: FieldMap = {};
		for (const col of columns) {
			const id =
				col.id ??
				("accessorKey" in col && typeof col.accessorKey === "string"
					? col.accessorKey
					: undefined);
			if (!id) continue;
			const meta = col.meta;
			if (meta?.sortField) map[id] = { sortField: meta.sortField };
		}
		return map;
	}, [columns]);

	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery<CursorResponse<TData>>({
		queryKey: [...queryKey, endpoint, sorting, columnFilters, baseParams],
		queryFn: async ({ pageParam }) => {
			const params = buildParams({
				cursor: pageParam as string | null,
				sorting,
				filters: columnFilters,
				baseParams,
				fieldMap,
			});
			const qs = params.toString();
			const url = qs ? `${endpoint}?${qs}` : endpoint;
			const response = await authApi.get(url);
			return response.data;
		},
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
	});

	const rows = data?.pages.flatMap((page) => page.data) ?? [];

	const table = useReactTable({
		data: rows,
		columns,
		state: { sorting, columnFilters },
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		// LOAD-BEARING: key rows by their stable id, not the array index — else
		// state would reassign to different rows on infinite-scroll appends.
		getRowId: (row) => row.id,
		manualSorting: true,
		manualFiltering: true,
		manualPagination: true,
		sortDescFirst: false,
		enableSortingRemoval: true,
		defaultColumn: {
			filterFn: passFilterFn as FilterFn<TData>,
			// Opt-in per column, and declared HERE so the table knows: a header-only
			// flag leaves getCanSort() true for everything, including a thumbnail,
			// and nothing can then build a truthful aria-sort.
			enableSorting: false,
		},
		getCoreRowModel: getCoreRowModel(),
	});

	return {
		table,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	};
}

export function buildParams({
	cursor,
	sorting,
	filters,
	baseParams,
	fieldMap,
}: {
	cursor: string | null;
	sorting: SortingState;
	filters: ColumnFiltersState;
	baseParams?: Record<string, string>;
	fieldMap: FieldMap;
}): URLSearchParams {
	const params = new URLSearchParams();
	if (baseParams) {
		for (const [key, value] of Object.entries(baseParams)) {
			params.append(key, value);
		}
	}
	if (cursor) params.set("cursor", cursor);
	for (const sort of sorting) {
		const field = fieldMap[sort.id]?.sortField ?? sort.id;
		params.append("sort", sort.desc ? `-${field}` : field);
	}
	for (const filter of filters) {
		const v = filter.value as
			| { operator: string; value: unknown }
			| { operator: string; values: unknown[] }
			| undefined;
		if (!v) continue;
		if ("values" in v) {
			if (v.values.length === 0) continue;
			params.append(`filter[${filter.id}][${v.operator}]`, v.values.join(","));
		} else {
			if (v.value === "" || v.value == null) continue;
			params.append(`filter[${filter.id}][${v.operator}]`, String(v.value));
		}
	}
	return params;
}
