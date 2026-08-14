import { useNavigate } from "@tanstack/react-router";
import { Languages, Pencil, UsersRound } from "lucide-react";
import { AppActivityCard } from "#/audit";
import { Card, CardContent } from "#/components/ui/card";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppDetailSkeleton } from "#/shared/components/AppDetailSkeleton";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useAudience } from "../hooks/use-audience";

// Audience detail: the tier's facts + an Edit action. Owns its fetch
// (skeleton / 404). Delete lands as a later slice. The list's name column
// links here.
export const AppAudienceDetail = ({
	tourOperatorId,
	audienceId,
}: {
	tourOperatorId: string;
	audienceId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const navigate = useNavigate();
	const query = useAudience(tourOperatorId, audienceId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/audiences"
			params={{ tourOperatorId }}
		>
			{m.back_to_audiences()}
		</AppBackLink>
	);

	const { canWrite } = usePermissions();

	return (
		<AppResourceView
			query={query}
			resource={m.audience()}
			icon={UsersRound}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.audiences() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={2} />}
		>
			{(audience) => {
				const created = formatDate(audience.createdAt);
				const actions: AppAction[] = [
					{
						id: "edit",
						label: m.edit(),
						icon: Pencil,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/audiences/$audienceId/edit",
								params: { tourOperatorId, audienceId },
							}),
					},
					{
						// ListAudienceTranslationsUseCase is ensureMember — STAFF may read them.
						id: "translations",
						label: m.translations(),
						icon: Languages,
						member: true,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/audiences/$audienceId/translations",
								params: { tourOperatorId, audienceId },
							}),
					},
				];
				return (
					<>
						<AppPageHeader
							title={audience.name}
							breadcrumb={
								<AppBreadcrumb
									items={[
										{ label: m.catalog() },
										{
											label: m.audiences(),
											to: "/tour-operators/$tourOperatorId/audiences",
											params: { tourOperatorId },
										},
										{ label: audience.name },
									]}
								/>
							}
							actions={<AppPageActions actions={actions} canWrite={canWrite} />}
						/>
						<Card>
							<CardContent>
								<dl className="grid grid-cols-2 gap-4">
									<AppDetailField label={m.pax_per_unit()}>
										{audience.paxPerUnit}
									</AppDetailField>
									<AppDetailField label={m.created()}>{created}</AppDetailField>
								</dl>
							</CardContent>
						</Card>
						<AppActivityCard
							tourOperatorId={tourOperatorId}
							entityType="AUDIENCE"
							entityId={audienceId}
						/>
					</>
				);
			}}
		</AppResourceView>
	);
};
