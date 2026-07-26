import type { AnyFieldApi } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";
import type { Audience } from "#/audiences";
import { Button } from "#/components/ui/button";
import { FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import * as m from "#/paraglide/messages";
import { RequiredMark } from "#/shared/components/RequiredMark";
import type { AudiencePriceRow } from "../validators/slot";
import { emptyPriceRow } from "../validators/slot";

const INTEGER_INPUT = /^\d*$/;
const DECIMAL_INPUT = /^\d*\.?\d*$/;

// The per-audience pricing rows shared by both create forms: each row picks an
// audience and sets its price + capacity for the departure(s). Follows the
// AppArrayInput house pattern — the whole array lives in ONE form field
// (`field.handleChange` replaces it), rows are gated inputs rather than nested
// fields, and the zod schema validates the array as a unit on submit (issues
// render below the rows). An audience already used by another row disappears
// from that row's options, so duplicates can't be picked.
export const AppAudiencePriceRows = ({
	field,
	audiences,
}: {
	field: AnyFieldApi;
	audiences: Audience[];
}) => {
	const rows = field.state.value as AudiencePriceRow[];
	const isInvalid =
		field.state.meta.isTouched && field.state.meta.errors.length > 0;

	const patch = (key: string, changes: Partial<AudiencePriceRow>) => {
		field.handleChange(
			rows.map((r) => (r._key === key ? { ...r, ...changes } : r)),
		);
	};

	return (
		<div className="flex flex-col gap-2" data-invalid={isInvalid || undefined}>
			<FieldLabel>
				{m.pricing()}
				<RequiredMark />
			</FieldLabel>
			<div className="grid grid-cols-[1fr_6rem_6rem_2.25rem] gap-2 text-xs text-muted-foreground">
				<span>{m.audience()}</span>
				<span>{m.price()}</span>
				<span>{m.capacity()}</span>
				<span />
			</div>
			{rows.map((row) => {
				// This row keeps its own pick; audiences taken by OTHER rows are hidden.
				const options = audiences.filter(
					(a) =>
						a.id === row.audienceId || !rows.some((r) => r.audienceId === a.id),
				);
				return (
					<div
						key={row._key}
						className="grid grid-cols-[1fr_6rem_6rem_2.25rem] gap-2"
					>
						<Select
							value={row.audienceId || undefined}
							onValueChange={(audienceId) => patch(row._key, { audienceId })}
						>
							<SelectTrigger
								className="w-full"
								aria-label={m.audience()}
								onBlur={field.handleBlur}
							>
								<SelectValue placeholder={m.audience()} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{options.map((a) => (
										<SelectItem key={a.id} value={a.id}>
											{a.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<Input
							type="text"
							inputMode="decimal"
							autoComplete="off"
							aria-label={m.price()}
							value={row.price}
							onChange={(e) => {
								if (DECIMAL_INPUT.test(e.target.value)) {
									patch(row._key, { price: e.target.value });
								}
							}}
							onBlur={field.handleBlur}
						/>
						<Input
							type="text"
							inputMode="numeric"
							autoComplete="off"
							aria-label={m.capacity()}
							value={row.capacity}
							onChange={(e) => {
								if (INTEGER_INPUT.test(e.target.value)) {
									patch(row._key, { capacity: e.target.value });
								}
							}}
							onBlur={field.handleBlur}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="shrink-0 text-muted-foreground"
							aria-label={m.remove()}
							disabled={rows.length === 1}
							onClick={() =>
								field.handleChange(rows.filter((r) => r._key !== row._key))
							}
						>
							<Trash2 />
						</Button>
					</div>
				);
			})}
			<div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={rows.length >= audiences.length}
					onClick={() => field.handleChange([...rows, emptyPriceRow()])}
				>
					<Plus />
					{m.add_audience()}
				</Button>
			</div>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</div>
	);
};
