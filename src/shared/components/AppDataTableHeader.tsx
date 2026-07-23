import type { HeaderContext } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "#/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import * as m from "#/paraglide/messages";
import { AppAsyncSetFilter } from "./AppAsyncSetFilter";
import { AppSetFilter, type SetFilterItem } from "./AppSetFilter";

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
	  })
	| (BaseProps<TData> & {
			allowFiltering: "setAsync";
			endpoint: string;
			queryKey: readonly unknown[];
			valueKey?: string;
			labelKey?: string;
	  });

// A column header with opt-in server-side sorting (toggles asc/desc/none) and an
// opt-in "set" filter → `filter[field][in]`, in two flavours: `set` (a static
// option list) and `setAsync` (options fetched from an endpoint). Both render a
// searchable, multi-select checkbox popover. The lean cut of the archive's
// header; text/number/date filters land when a list needs them.
export function AppDataTableHeader<TData>(props: Props<TData>) {
	const { label, headerContext, allowSorting, allowFiltering } = props;
	const { column } = headerContext;
	const sorted = column.getIsSorted();
	const SortIcon =
		sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
	const hasActiveFilter = column.getFilterValue() !== undefined;

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

			{allowFiltering && (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="relative size-7 cursor-pointer"
							aria-label={m.filter_label()}
						>
							<Filter className="size-3.5" />
							{hasActiveFilter && (
								<span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-52">
						{props.allowFiltering === "set" ? (
							<AppSetFilter headerContext={headerContext} items={props.items} />
						) : (
							<AppAsyncSetFilter
								headerContext={headerContext}
								endpoint={props.endpoint}
								queryKey={props.queryKey}
								valueKey={props.valueKey}
								labelKey={props.labelKey}
							/>
						)}
					</PopoverContent>
				</Popover>
			)}
		</div>
	);
}
