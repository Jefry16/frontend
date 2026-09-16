import {
	AppQueryState,
	FieldError,
	type QueryState,
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
	useAllPages,
} from "@vointika/ui";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";

interface ExperienceRow {
	id: string;
	name: string;
}
interface PageRow {
	id: string;
	title: string;
	handle: string;
}
interface CategoryRow {
	id: string;
	name: string;
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
	kind: "EXPERIENCE" | "PAGE" | "CATEGORY";
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
	const categories = useAllPages<CategoryRow>(
		queryKeys.categories(tourOperatorId),
		`/tour-operators/${tourOperatorId}/categories`,
	);
	const placeholder = {
		EXPERIENCE: m.select_experience,
		PAGE: m.select_page,
		CATEGORY: m.select_category,
	}[kind]();
	const catalogue: QueryState<Option[]> =
		kind === "EXPERIENCE"
			? {
					...experiences,
					data: experiences.data?.map((row) => ({
						id: row.id,
						label: row.name,
					})),
				}
			: kind === "PAGE"
				? {
						...pages,
						data: pages.data?.map((row) => ({
							id: row.id,
							label: row.title,
						})),
					}
				: {
						...categories,
						data: categories.data?.map((row) => ({
							id: row.id,
							label: row.name,
						})),
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
							<SelectValue placeholder={placeholder} />
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
