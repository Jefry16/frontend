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
import * as m from "#/paraglide/messages";

// The row shapes we need from the catalogue endpoints — declared locally so
// the menus module doesn't import experiences/pages just for two fields.
interface ExperienceRow {
	id: string;
	name: string;
}
interface PageRow {
	id: string;
	title: string;
	handle: string;
}

// The EXPERIENCE/PAGE target picker of a menu item: the operator's bounded
// catalogue of the picked kind. The stored value is the target's id.
export const AppMenuTargetSelect = ({
	kind,
	tourOperatorId,
	value,
	onValueChange,
	ariaLabel,
}: {
	kind: "EXPERIENCE" | "PAGE";
	tourOperatorId: string;
	value: string;
	onValueChange: (value: string) => void;
	ariaLabel: string;
}) => {
	const experiences = useAllPages<ExperienceRow>(
		queryKeys.experiences(tourOperatorId),
		`/tour-operators/${tourOperatorId}/experiences`,
	);
	const pages = useAllPages<PageRow>(
		queryKeys.pages(tourOperatorId),
		`/tour-operators/${tourOperatorId}/pages`,
	);
	const catalogue = kind === "EXPERIENCE" ? experiences : pages;

	if (catalogue.isPending) {
		return <Skeleton className="h-9 w-full" />;
	}
	// Without this, a failed fetch renders as an empty "Not set" select — a
	// lie about the stored target.
	if (catalogue.isError) {
		return <p className="text-sm text-destructive">{m.error()}</p>;
	}

	const options =
		kind === "EXPERIENCE"
			? experiences.rows.map((row) => ({ id: row.id, label: row.name }))
			: pages.rows.map((row) => ({ id: row.id, label: row.title }));

	return (
		<Select value={value || undefined} onValueChange={onValueChange}>
			<SelectTrigger className="w-full" aria-label={ariaLabel}>
				<SelectValue
					placeholder={
						kind === "EXPERIENCE" ? m.select_experience() : m.select_page()
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
	);
};
