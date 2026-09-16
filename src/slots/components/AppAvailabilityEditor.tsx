import {
	AppEmptyState,
	AppFormSkeleton,
	AppPageHeader,
	AppResourceView,
	mergeQueryState,
	useAllPages,
} from "@vointika/ui";
import { CalendarDays, UsersRound } from "lucide-react";
import type { Audience } from "#/audiences";
import { useExperience } from "#/experiences";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { usePermissions } from "#/session";
import { AppBackLink, AppBreadcrumb, AppNewLink } from "#/shared/links";
import { AppSlotForm } from "./AppSlotForm";

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

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/availability"
			params={{ tourOperatorId }}
		>
			{m.back_to_availability()}
		</AppBackLink>
	);

	return (
		<AppResourceView
			query={query}
			resource={m.add_availability()}
			icon={CalendarDays}
			breadcrumb={breadcrumb()}
			notFoundAction={backLink}
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
						<AppSlotForm
							tourOperatorId={tourOperatorId}
							experienceId={experienceId}
							audiences={rows}
						/>
					)}
				</>
			)}
		</AppResourceView>
	);
};
