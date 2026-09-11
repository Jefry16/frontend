import { CalendarDays, UsersRound } from "lucide-react";
import { useState } from "react";
import type { Audience } from "#/audiences";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useExperience } from "#/experiences";
import { useAllPages } from "#/hooks/use-all-pages";
import { apiErrorMessage } from "#/lib/api-error";
import { queryKeys } from "#/lib/query-keys";
import { cn } from "#/lib/utils";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppEmptyState } from "#/shared/components/AppEmptyState";
import { AppError } from "#/shared/components/AppError";
import { AppNewLink } from "#/shared/components/AppNewLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { AppRecurringSlotForm } from "./AppRecurringSlotForm";
import { AppSingleSlotForm } from "./AppSingleSlotForm";

export const AppAvailabilityEditor = ({
	tourOperatorId,
	experienceId,
}: {
	tourOperatorId: string;
	experienceId: string;
}) => {
	const query = useExperience(tourOperatorId, experienceId);
	const audiences = useAllPages<Audience>(
		queryKeys.audiences(tourOperatorId),
		`/tour-operators/${tourOperatorId}/audiences`,
	);
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
			loading={
				<Card>
					<CardContent className="flex flex-col gap-4">
						{["a", "b", "c"].map((k) => (
							<Skeleton key={k} className="h-12 w-full" />
						))}
					</CardContent>
				</Card>
			}
		>
			{(experience) => (
				<>
					<AppPageHeader
						title={m.add_availability()}
						description={experience.name}
						breadcrumb={breadcrumb(m.add_availability())}
					/>
					{audiences.isPending ? (
						<Card>
							<CardContent className="flex flex-col gap-4">
								{["a", "b", "c"].map((k) => (
									<Skeleton key={k} className="h-12 w-full" />
								))}
							</CardContent>
						</Card>
					) : audiences.isError ? (
						<AppError
							description={apiErrorMessage(audiences.error)}
							onRetry={() => audiences.refetch()}
						/>
					) : audiences.rows.length === 0 ? (
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
										audiences={audiences.rows}
									/>
								) : (
									<AppSingleSlotForm
										tourOperatorId={tourOperatorId}
										experienceId={experienceId}
										audiences={audiences.rows}
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
