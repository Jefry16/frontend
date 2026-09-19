import {
	AppLabelledControl,
	AppQueryState,
	AppSelect,
	AppSkeleton,
	type QueryState,
	SelectItem,
	useAllPages,
} from "@vointika/ui";
import { useId } from "react";
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
	label,
	errors,
}: {
	kind: "EXPERIENCE" | "PAGE" | "CATEGORY";
	tourOperatorId: string;
	value: string;
	onValueChange: (value: string) => void;
	label: string;
	errors?: { message?: string }[];
}) => {
	const id = useId();
	const experiences = useAllPages<ExperienceRow>(
		queryKeys.experiences(tourOperatorId),
		`/tour-operators/${tourOperatorId}/experiences`,
		{ enabled: kind === "EXPERIENCE" },
	);
	const pages = useAllPages<PageRow>(
		queryKeys.pages(tourOperatorId),
		`/tour-operators/${tourOperatorId}/pages`,
		{ enabled: kind === "PAGE" },
	);
	const categories = useAllPages<CategoryRow>(
		queryKeys.categories(tourOperatorId),
		`/tour-operators/${tourOperatorId}/categories`,
		{ enabled: kind === "CATEGORY" },
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
			loading={<AppSkeleton variant="control" />}
		>
			{(options) => (
				<AppLabelledControl
					label={label}
					htmlFor={id}
					hideLabel
					invalid={invalid}
					errors={errors}
				>
					<AppSelect
						id={id}
						value={value}
						onValueChange={onValueChange}
						aria-invalid={invalid || undefined}
						placeholder={placeholder}
					>
						{options.map((option) => (
							<SelectItem key={option.id} value={option.id}>
								{option.label}
							</SelectItem>
						))}
					</AppSelect>
				</AppLabelledControl>
			)}
		</AppQueryState>
	);
};
