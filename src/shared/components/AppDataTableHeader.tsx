import type { HeaderContext } from "@tanstack/react-table";
import {
	AppSetFilter,
	AppTextFilter,
	Button,
	Popover,
	PopoverContent,
	PopoverTrigger,
	type SetFilterItem,
} from "@vointika/ui";
import { ArrowDown, ArrowUp, ArrowUpDown, Filter } from "lucide-react";
import * as m from "#/paraglide/messages";
import { AppAsyncSetFilter } from "./AppAsyncSetFilter";

interface BaseProps<TData> {
	label: string;
	headerContext: HeaderContext<TData, unknown>;
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
	  })
	| (BaseProps<TData> & { allowFiltering: "text" });

export function AppDataTableHeader<TData>(props: Props<TData>) {
	const { label, headerContext, allowFiltering } = props;
	const { column } = headerContext;
	const canSort = column.columnDef.enableSorting === true;
	const sorted = column.getIsSorted();
	const SortIcon =
		sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;
	const hasActiveFilter = column.getFilterValue() !== undefined;

	return (
		<div className="flex flex-row items-center gap-1">
			{canSort ? (
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
							aria-label={m.filter_column({ column: label })}
						>
							<Filter className="size-3.5" />
							{hasActiveFilter && (
								<span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent align="end" className="w-52">
						{props.allowFiltering === "text" ? (
							<AppTextFilter headerContext={headerContext} />
						) : props.allowFiltering === "set" ? (
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
