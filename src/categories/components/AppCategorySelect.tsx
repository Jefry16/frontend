import {
	AppFormSkeleton,
	AppQueryState,
	FieldError,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
	useAllPages,
} from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import type { Category } from "../types";

export const AppCategorySelect = ({
	tourOperatorId,
	value,
	onValueChange,
	errors,
}: {
	tourOperatorId: string;
	value: string | null;
	onValueChange: (value: string | null) => void;
	errors?: Array<{ message?: string } | undefined>;
}) => {
	const catalogue = useAllPages<Category>(
		queryKeys.categories(tourOperatorId),
		`/tour-operators/${tourOperatorId}/categories`,
	);
	const invalid = (errors?.length ?? 0) > 0;

	return (
		<AppQueryState
			query={catalogue}
			loading={<AppFormSkeleton rows={1} card={false} />}
		>
			{(categories) => (
				<div className="flex flex-col gap-1">
					<Select
						value={value ?? "unset"}
						onValueChange={(v) => onValueChange(v === "unset" ? null : v)}
					>
						<SelectTrigger
							className="w-full"
							aria-invalid={invalid || undefined}
						>
							<SelectValue placeholder={m.not_set()} />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="unset">{m.not_set()}</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
					{invalid && <FieldError errors={errors} />}
				</div>
			)}
		</AppQueryState>
	);
};
