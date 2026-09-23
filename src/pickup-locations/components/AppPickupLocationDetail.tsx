import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	type AppAction,
	AppCard,
	AppDetailField,
	AppDetailSkeleton,
	AppEmptyState,
	AppPageActions,
	AppPageHeader,
	AppResourceView,
	AppStaticTable,
	useAppToast,
} from "@vointika/ui";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import {
	useOperatorCurrency,
	useOperatorDateTime,
	usePermissions,
} from "#/session";
import { audiencePriceColumns } from "#/shared/audience-price-columns";
import { AppBackLink, AppBreadcrumb } from "#/shared/links";
import { formatTime } from "../format";
import { usePickupLocation } from "../hooks/use-pickup-location";
import { usePickupLocationActions } from "../hooks/use-pickup-location-actions";

export const AppPickupLocationDetail = ({
	tourOperatorId,
	pickupLocationId,
}: {
	tourOperatorId: string;
	pickupLocationId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
	const currency = useOperatorCurrency();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const toast = useAppToast();
	const query = usePickupLocation(tourOperatorId, pickupLocationId);
	const { remove } = usePickupLocationActions(tourOperatorId, pickupLocationId);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/pickup-locations"
			params={{ tourOperatorId }}
		>
			{m.back_to_pickup_locations()}
		</AppBackLink>
	);

	const { canWrite } = usePermissions();

	return (
		<AppResourceView
			query={query}
			resource={m.pickup_location()}
			icon={MapPin}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.pickup_locations() }]}
				/>
			}
			notFoundAction={backLink}
			loading={<AppDetailSkeleton fields={2} />}
		>
			{(pickup) => {
				const created = formatDate(pickup.createdAt);
				const actions: AppAction[] = [
					{
						id: "edit",
						label: m.edit(),
						icon: Pencil,
						onSelect: () =>
							navigate({
								to: "/tour-operators/$tourOperatorId/pickup-locations/$pickupLocationId/edit",
								params: { tourOperatorId, pickupLocationId },
							}),
					},
					{
						id: "delete",
						label: m.delete_pickup_location(),
						icon: Trash2,
						variant: "destructive",
						pending: remove.isPending,
						confirm: {
							title: m.delete_pickup_location_title(),
							description: m.delete_pickup_location_body(),
						},
						onSelect: () =>
							remove.mutate(undefined, {
								onSuccess: () => {
									toast.deleted(m.pickup_location());
									queryClient.removeQueries({
										queryKey: queryKeys.pickupLocation(
											tourOperatorId,
											pickupLocationId,
										),
									});
									navigate({
										to: "/tour-operators/$tourOperatorId/pickup-locations",
										params: { tourOperatorId },
									});
								},
							}),
					},
				];
				return (
					<>
						<AppPageHeader
							title={pickup.name}
							breadcrumb={
								<AppBreadcrumb
									items={[
										{ label: m.catalog() },
										{
											label: m.pickup_locations(),
											to: "/tour-operators/$tourOperatorId/pickup-locations",
											params: { tourOperatorId },
										},
										{ label: pickup.name },
									]}
								/>
							}
							actions={<AppPageActions actions={actions} canWrite={canWrite} />}
						/>
						<AppCard>
							<dl className="grid grid-cols-2 gap-4">
								<AppDetailField label={m.time()}>
									{formatTime(pickup.time)}
								</AppDetailField>
								<AppDetailField label={m.created()}>{created}</AppDetailField>
							</dl>
						</AppCard>
						<AppCard title={m.pickup_prices()}>
							{pickup.audiencePrices.length === 0 ? (
								<AppEmptyState
									variant="inline"
									title={m.pickup_prices_no_audiences()}
								/>
							) : (
								<AppStaticTable
									columns={audiencePriceColumns(currency, getLocale())}
									rows={pickup.audiencePrices}
									rowKey={(row) => row.audienceId}
								/>
							)}
						</AppCard>
					</>
				);
			}}
		</AppResourceView>
	);
};
