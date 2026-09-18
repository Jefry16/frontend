import { useNavigate } from "@tanstack/react-router";
import {
	type AppAction,
	AppCard,
	AppDetailField,
	AppDetailSkeleton,
	AppPageActions,
	AppPageHeader,
	AppResourceView,
} from "@vointika/ui";
import { Languages, Pencil, UsersRound } from "lucide-react";
import * as m from "#/paraglide/messages";
import { useOperatorDateTime, usePermissions } from "#/session";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { useAudience } from "../hooks/use-audience";

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
						<AppCard>
							<dl className="grid grid-cols-2 gap-4">
								<AppDetailField label={m.pax_per_unit()}>
									{audience.paxPerUnit}
								</AppDetailField>
								<AppDetailField label={m.created()}>{created}</AppDetailField>
							</dl>
						</AppCard>
					</>
				);
			}}
		</AppResourceView>
	);
};
