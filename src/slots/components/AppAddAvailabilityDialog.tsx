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
	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const experiences = useAllPages<ExperienceRow>(
		queryKeys.experiences(tourOperatorId),
		`/tour-operators/${tourOperatorId}/experiences`,
		{ enabled: open },
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				if (!next) setSearch("");
			}}
		>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{m.choose_experience()}</DialogTitle>
					<DialogDescription>{m.choose_experience_hint()}</DialogDescription>
				</DialogHeader>
				<AppQueryState
					query={experiences}
					loading={<AppLoadingBlock className="py-8" />}
				>
					{(rows) => {
						const filtered = rows.filter((e) =>
							e.name.toLowerCase().includes(search.trim().toLowerCase()),
						);
						return rows.length === 0 ? (
							<div className="flex flex-col items-center gap-3 py-6 text-center">
								<Compass className="size-8 opacity-40" />
								<p className="text-sm text-muted-foreground">
									{m.no_experiences()}
								</p>
								<Button asChild size="sm">
									<AppLink
										to="/tour-operators/$tourOperatorId/experiences/new"
										params={{ tourOperatorId }}
									>
										<Plus />
										{m.new_experience()}
									</AppLink>
								</Button>
							</div>
						) : (
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
													params: {
														tourOperatorId,
														experienceId: experience.id,
													},
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
					}}
				</AppQueryState>
			</DialogContent>
		</Dialog>
	);
};
