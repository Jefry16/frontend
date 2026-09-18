import type { AnyFieldApi } from "@tanstack/react-form";
import {
	AppNumericInput,
	AppSelect,
	Button,
	FieldError,
	FieldLabel,
	RequiredMark,
	SelectItem,
} from "@vointika/ui";
import { Plus, Trash2 } from "lucide-react";
import type { Audience } from "#/audiences";
import * as m from "#/paraglide/messages";
import type { AudiencePriceRow } from "../validators/slot";
import { emptyPriceRow } from "../validators/slot";

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
				const options = audiences.filter(
					(a) =>
						a.id === row.audienceId || !rows.some((r) => r.audienceId === a.id),
				);
				return (
					<div
						key={row._key}
						className="grid grid-cols-[1fr_6rem_6rem_2.25rem] gap-2"
					>
						<AppSelect
							value={row.audienceId}
							onValueChange={(audienceId) => patch(row._key, { audienceId })}
							aria-label={m.audience()}
							onBlur={field.handleBlur}
							placeholder={m.audience()}
						>
							{options.map((a) => (
								<SelectItem key={a.id} value={a.id}>
									{a.name}
								</SelectItem>
							))}
						</AppSelect>
						<AppNumericInput
							decimal
							aria-label={m.price()}
							value={row.price}
							onValueChange={(price) => patch(row._key, { price })}
							onBlur={field.handleBlur}
						/>
						<AppNumericInput
							aria-label={m.capacity()}
							value={row.capacity}
							onValueChange={(capacity) => patch(row._key, { capacity })}
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
