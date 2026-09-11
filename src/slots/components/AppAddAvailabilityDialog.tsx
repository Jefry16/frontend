import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Compass, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { useAllPages } from "#/hooks/use-all-pages";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppEmptyState } from "#/shared/components/AppEmptyState";
import { AppLink } from "#/shared/components/AppLink";
import { AppLoadingBlock } from "#/shared/components/AppLoadingBlock";
import { AppQueryState } from "#/shared/components/AppQueryState";

interface ExperienceRow {
	id: string;
	name: string;
}

export const AppAddAvailabilityDialog = ({
	tourOperatorId,
	open,
	onOpenChange,
}: {
	tourOperatorId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const experiences = useAllPages<ExperienceRow>(
		queryKeys.experiences(tourOperatorId),
		`/tour-operators/${tourOperatorId}/experiences`,
		{ enabled: open },
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{m.choose_experience()}</DialogTitle>
					<DialogDescription>{m.choose_experience_hint()}</DialogDescription>
				</DialogHeader>
				<AppQueryState
					query={experiences}
					loading={<AppLoadingBlock className="py-8" />}
				>
					{(rows) =>
						rows.length === 0 ? (
							<AppEmptyState
								icon={Compass}
								title={m.no_experiences()}
								action={
									<Button asChild size="sm">
										<AppLink
											to="/tour-operators/$tourOperatorId/experiences/new"
											params={{ tourOperatorId }}
										>
											<Plus />
											{m.new_experience()}
										</AppLink>
									</Button>
								}
							/>
						) : (
							<ExperiencePicker rows={rows} tourOperatorId={tourOperatorId} />
						)
					}
				</AppQueryState>
			</DialogContent>
		</Dialog>
	);
};

const ExperiencePicker = ({
	rows,
	tourOperatorId,
}: {
	rows: ExperienceRow[];
	tourOperatorId: string;
}) => {
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const filtered = rows.filter((e) =>
		e.name.toLowerCase().includes(search.trim().toLowerCase()),
	);

	return (
		<div className="flex flex-col gap-2">
			<Input
				autoFocus
				placeholder={m.search()}
				value={search}
				onChange={(e) => setSearch(e.target.value)}
			/>
			<div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
				{filtered.map((experience) => (
					<Button
						key={experience.id}
						type="button"
						variant="ghost"
						className="justify-between"
						onClick={() =>
							navigate({
								to: "/tour-operators/$tourOperatorId/availability/new/$experienceId",
								params: { tourOperatorId, experienceId: experience.id },
							})
						}
					>
						<span className="truncate">{experience.name}</span>
						<ChevronRight className="text-muted-foreground" />
					</Button>
				))}
			</div>
		</div>
	);
};
