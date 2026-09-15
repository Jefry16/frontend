import {
	AppEmptyState,
	AppFormSkeleton,
	AppPageHeader,
	AppResourceView,
	Button,
	Card,
	CardContent,
	cn,
	mergeQueryState,
	useAllPages,
} from "@vointika/ui";
import { CalendarDays, UsersRound } from "lucide-react";
import { useState } from "react";
import type { Audience } from "#/audiences";
import { useExperience } from "#/experiences";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBreadcrumb, AppNewLink } from "#/shared/links";
import { AppRecurringSlotForm } from "./AppRecurringSlotForm";
import { AppSingleSlotForm } from "./AppSingleSlotForm";

export const AppAvailabilityEditor = ({
	tourOperatorId,
	experienceId,
}: {
	tourOperatorId: string;
	experienceId: string;
}) => {
	const experience = useExperience(tourOperatorId, experienceId);
	const audiences = useAllPages<Audience>(
		queryKeys.audiences(tourOperatorId),
		`/tour-operators/${tourOperatorId}/audiences`,
	);
	const query = mergeQueryState(experience, audiences, (record, rows) => ({
		record,
		rows,
	}));
	const [mode, setMode] = useState<"recurring" | "single">("recurring");
	const { canWrite } = usePermissions();

	const breadcrumb = (label?: string) => (
		<AppBreadcrumb
			items={[
				{ label: m.catalog() },
				{
					label: m.availability(),
					to: "/tour-operators/$tourOperatorId/availability",
					params: { tourOperatorId },
				},
				...(label ? [{ label }] : []),
			]}
		/>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.add_availability()}
			icon={CalendarDays}
			breadcrumb={breadcrumb()}
			loading={<AppFormSkeleton rows={3} />}
		>
			{({ record, rows }) => (
				<>
					<AppPageHeader
						title={m.add_availability()}
						description={record.name}
						breadcrumb={breadcrumb(m.add_availability())}
					/>
					{rows.length === 0 ? (
						<AppEmptyState
							icon={UsersRound}
							title={m.no_audiences_for_slots()}
							description={m.no_audiences_for_slots_body()}
							action={
								canWrite && (
									<AppNewLink
										to="/tour-operators/$tourOperatorId/audiences/new"
										params={{ tourOperatorId }}
									>
										{m.new_audience()}
									</AppNewLink>
								)
							}
						/>
					) : (
						<Card>
							<CardContent className="flex flex-col gap-4">
								<div>
									<div className="inline-flex rounded-md border p-0.5">
										{(
											[
												{ value: "recurring", label: m.recurring() },
												{ value: "single", label: m.one_time() },
											] as const
										).map((option) => (
											<Button
												key={option.value}
												type="button"
												variant="ghost"
												size="sm"
												className={cn(
													option.value === mode &&
														"bg-secondary text-secondary-foreground",
												)}
												onClick={() => setMode(option.value)}
											>
												{option.label}
											</Button>
										))}
									</div>
									<p className="mt-2 text-sm text-muted-foreground">
										{mode === "recurring"
											? m.recurring_hint()
											: m.one_time_hint()}
									</p>
								</div>
								{mode === "recurring" ? (
									<AppRecurringSlotForm
										tourOperatorId={tourOperatorId}
										experienceId={experienceId}
										audiences={rows}
									/>
								) : (
									<AppSingleSlotForm
										tourOperatorId={tourOperatorId}
										experienceId={experienceId}
										audiences={rows}
									/>
								)}
							</CardContent>
						</Card>
					)}
				</>
			)}
		</AppResourceView>
	);
};
