import type { HeaderContext } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import * as m from "#/paraglide/messages";

export interface SetFilterItem {
	value: string;
	label: string;
}

// The value shape written to the column; useDataTable serializes it to
// `filter[field][in]=a,b`.
interface SetFilterValue {
	operator: "in";
	values: string[];
}

// Above this many options, show a search box to narrow the list — small sets
// (e.g. role) don't need one.
const SEARCH_THRESHOLD = 8;

// The set filter's body (rendered inside the header's popover): a multi-select
// checkbox list, with a search field for long option lists. Reads/writes the
// column's filter value directly — the checked set IS the filter state.
export function AppSetFilter<TData>({
	headerContext,
	items,
}: {
	headerContext: HeaderContext<TData, unknown>;
	items: readonly SetFilterItem[];
}) {
	const { column } = headerContext;
	const current = column.getFilterValue() as SetFilterValue | undefined;
	const selected = new Set(current?.values ?? []);
	const [search, setSearch] = useState("");

	const toggle = (value: string) => {
		const next = new Set(selected);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		column.setFilterValue(
			next.size
				? { operator: "in", values: Array.from(next).sort() }
				: undefined,
		);
	};

	const showSearch = items.length > SEARCH_THRESHOLD;
	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items;
	}, [items, search]);

	return (
		<div className="flex flex-col gap-2">
			{selected.size > 0 && (
				<div className="flex items-center justify-between gap-2">
					<span className="text-xs text-muted-foreground">
						{m.n_selected({ count: selected.size })}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-auto p-0 text-xs"
						onClick={() => column.setFilterValue(undefined)}
					>
						{m.clear()}
					</Button>
				</div>
			)}
			{showSearch && (
				<Input
					placeholder={m.search()}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="h-8"
				/>
			)}
			<div className="flex max-h-60 flex-col gap-1.5 overflow-auto">
				{filtered.length === 0 ? (
					<p className="py-2 text-center text-sm text-muted-foreground">
						{m.no_results()}
					</p>
				) : (
					filtered.map((item) => (
						<Label
							key={item.value}
							className="flex cursor-pointer items-center gap-2 font-normal"
						>
							<Checkbox
								checked={selected.has(item.value)}
								onCheckedChange={() => toggle(item.value)}
							/>
							<span className="truncate">{item.label}</span>
						</Label>
					))
				)}
			</div>
		</div>
	);
}
