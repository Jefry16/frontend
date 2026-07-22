import type { HeaderContext } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import * as m from "#/paraglide/messages";

export interface SetFilterItem {
	value: string;
	label: string;
}

// The value shape the set filter writes; useDataTable serializes it to
// `filter[field][in]=a,b`.
interface SetFilterValue {
	operator: "in";
	values: string[];
}

interface BaseProps<TData> {
	label: string;
	headerContext: HeaderContext<TData, unknown>;
	allowSorting?: boolean;
}

type Props<TData> =
	| (BaseProps<TData> & { allowFiltering?: never })
	| (BaseProps<TData> & {
			allowFiltering: "set";
			items: readonly SetFilterItem[];
	  });

// A column header with opt-in server-side sorting (toggles asc/desc/none) and an
// opt-in "set" filter (a multi-select dropdown → `filter[field][in]`). The lean
// cut of the archive's header — text/number/date/async filters land when a list
// needs them.
export function AppDataTableHeader<TData>(props: Props<TData>) {
	const { label, headerContext, allowSorting, allowFiltering } = props;
	const { column } = headerContext;
	const sorted = column.getIsSorted();
	const SortIcon =
		sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

	const current = column.getFilterValue() as SetFilterValue | undefined;
	const selected = new Set(current?.values ?? []);
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

	return (
		<div className="flex flex-row items-center gap-1">
			{allowSorting ? (
				<Button
					variant="link"
					className="cursor-pointer p-0 font-semibold hover:no-underline has-[>svg]:p-0"
					onClick={() => column.toggleSorting()}
				>
					{label}
					<SortIcon className="ml-1 size-3.5 opacity-60" />
				</Button>
			) : (
				<span className="font-semibold">{label}</span>
			)}

			{allowFiltering === "set" && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="relative size-7 cursor-pointer"
							aria-label={m.filter_label()}
						>
							<Filter className="size-3.5" />
							{selected.size > 0 && (
								<span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48">
						{props.items.map((item) => (
							<DropdownMenuCheckboxItem
								key={item.value}
								checked={selected.has(item.value)}
								// Keep the menu open so several values can be toggled at once.
								onSelect={(e) => e.preventDefault()}
								onCheckedChange={() => toggle(item.value)}
							>
								{item.label}
							</DropdownMenuCheckboxItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}
