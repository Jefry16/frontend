import { type ColumnDef, flexRender } from "@tanstack/react-table";
import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Skeleton } from "#/components/ui/skeleton";
import { Spinner } from "#/components/ui/spinner";
import {
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { cn } from "#/lib/utils";
import * as m from "#/paraglide/messages";
import { AppEmptyState } from "./AppEmptyState";
import { useDataTable } from "./useDataTable";

// Stable keys for the loading skeleton rows (avoid array-index keys).
const SKELETON_ROW_KEYS = ["s0", "s1", "s2", "s3", "s4", "s5"];

/** First-run empty state for a genuinely empty (unfiltered) list. */
interface EmptyStateConfig {
	icon?: LucideIcon;
	title: string;
	description?: string;
	action?: ReactNode;
}

interface Props<TData extends { id: string }> {
	columns: ColumnDef<TData, unknown>[];
	endpoint: string;
	queryKey: readonly unknown[];
	baseParams?: Record<string, string>;
	// Shown when the list is genuinely empty (no rows AND no active filter). A
	// filtered-to-nothing list keeps the terse "No results" row.
	emptyState?: EmptyStateConfig;
}

// The rendered list shell over useDataTable: sticky header, skeleton loading,
// error row, empty state (first-run CTA vs filtered "No results"), and infinite
// scroll via an IntersectionObserver sentinel. Server-driven sort/filter come
// from the column headers (see AppDataTableHeader).
export function AppDataTable<TData extends { id: string }>({
	columns,
	endpoint,
	queryKey,
	baseParams,
	emptyState,
}: Props<TData>) {
	const {
		table,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useDataTable({ columns, endpoint, queryKey, baseParams });

	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ rootMargin: "200px" },
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const rows = table.getRowModel().rows;
	const visibleColumns = table.getVisibleFlatColumns();
	const colSpan = visibleColumns.length;
	// First-run (show the CTA) vs filtered-to-nothing (show "No results").
	const filtersActive = table.getState().columnFilters.length > 0;
	const showEmptyState = Boolean(emptyState) && !filtersActive;

	return (
		<div className="overflow-hidden rounded-md border bg-card shadow-sm">
			<div className="relative max-h-[600px] overflow-auto">
				<table className="w-full caption-bottom border-separate border-spacing-0 text-sm">
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className={cn(
											"sticky top-0 z-10 border-b bg-card px-3 py-3 font-semibold",
											header.column.columnDef.meta?.align === "right" &&
												"text-right",
										)}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{error ? (
							<TableRow>
								<TableCell colSpan={colSpan} className="text-center">
									{error.message}
								</TableCell>
							</TableRow>
						) : isLoading ? (
							SKELETON_ROW_KEYS.map((rowKey) => (
								<TableRow key={rowKey}>
									{visibleColumns.map((col) => (
										<TableCell key={col.id} className="border-b">
											<Skeleton className="h-4 w-full max-w-[180px]" />
										</TableCell>
									))}
								</TableRow>
							))
						) : rows.length ? (
							rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className={cn(
												"border-b",
												cell.column.columnDef.meta?.align === "right" &&
													"text-right tabular-nums",
											)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={colSpan}
									className={showEmptyState ? "py-10" : "h-40"}
								>
									{showEmptyState && emptyState ? (
										<AppEmptyState {...emptyState} />
									) : (
										<div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
											<Inbox className="size-8 opacity-40" />
											<span className="text-sm">{m.no_results()}</span>
										</div>
									)}
								</TableCell>
							</TableRow>
						)}
						{isFetchingNextPage && (
							<TableRow>
								<TableCell colSpan={colSpan} className="h-12">
									<div className="flex items-center justify-center">
										<Spinner />
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</table>
				<div ref={sentinelRef} aria-hidden className="h-1" />
			</div>
		</div>
	);
}
