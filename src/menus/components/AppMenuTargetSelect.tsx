import { FieldError } from "#/components/ui/field";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
import { useAllPages } from "#/hooks/use-all-pages";
import { queryKeys } from "#/lib/query-keys";
import type { QueryState } from "#/lib/query-state";
import * as m from "#/paraglide/messages";
import { AppQueryState } from "#/shared/components/AppQueryState";

interface ExperienceRow {
	id: string;
	name: string;
}
interface PageRow {
	id: string;
	title: string;
	handle: string;
}
interface Option {
	id: string;
	label: string;
}

export const AppMenuTargetSelect = ({
	kind,
	tourOperatorId,
	value,
	onValueChange,
	ariaLabel,
	errors,
}: {
	kind: "EXPERIENCE" | "PAGE";
	tourOperatorId: string;
	value: string;
	onValueChange: (value: string) => void;
	ariaLabel: string;
	errors?: { message?: string }[];
}) => {
	const experiences = useAllPages<ExperienceRow>(
		queryKeys.experiences(tourOperatorId),
		`/tour-operators/${tourOperatorId}/experiences`,
	);
	const pages = useAllPages<PageRow>(
		queryKeys.pages(tourOperatorId),
		`/tour-operators/${tourOperatorId}/pages`,
	);
	const catalogue: QueryState<Option[]> =
		kind === "EXPERIENCE"
			? {
					...experiences,
					data: experiences.data?.map((row) => ({
						id: row.id,
						label: row.name,
					})),
				}
			: {
					...pages,
					data: pages.data?.map((row) => ({ id: row.id, label: row.title })),
				};
	const invalid = (errors?.length ?? 0) > 0;

	return (
		<AppQueryState
			query={catalogue}
			loading={<Skeleton className="h-9 w-full" />}
		>
			{(options) => (
				<div className="flex flex-col gap-1">
					<Select value={value || undefined} onValueChange={onValueChange}>
						<SelectTrigger
							className="w-full"
							aria-label={ariaLabel}
							aria-invalid={invalid || undefined}
						>
							<SelectValue
								placeholder={
									kind === "EXPERIENCE"
										? m.select_experience()
										: m.select_page()
								}
							/>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{options.map((option) => (
									<SelectItem key={option.id} value={option.id}>
										{option.label}
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
