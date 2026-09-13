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
	interface ColumnMeta<TData extends RowData, TValue> {
		sortField?: string;
		align?: "right";
	}
}

type FieldMap = Record<string, { sortField?: string }>;

const passFilterFn: FilterFn<unknown> = () => true;

interface CursorResponse<TData> {
	data: TData[];
	nextCursor: string | null;
}

const tableKey = (
	queryKey: readonly unknown[],
	endpoint: string,
	sorting: SortingState = [],
	columnFilters: ColumnFiltersState = [],
	baseParams?: Record<string, string>,
) => [...queryKey, endpoint, sorting, columnFilters, baseParams] as const;

interface UseDataTableProps<TData> {
	columns: ColumnDef<TData, unknown>[];
	endpoint: string;
	queryKey: readonly unknown[];
	baseParams?: Record<string, string>;
}

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
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery<CursorResponse<TData>>({
		queryKey: tableKey(queryKey, endpoint, sorting, columnFilters, baseParams),
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
		getRowId: (row) => row.id,
		manualSorting: true,
		manualFiltering: true,
		manualPagination: true,
		sortDescFirst: false,
		enableSortingRemoval: true,
		defaultColumn: {
			filterFn: passFilterFn as FilterFn<TData>,
			enableSorting: false,
		},
		getCoreRowModel: getCoreRowModel(),
	});

	return {
		table,
		isLoading,
		error,
		refetch,
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
