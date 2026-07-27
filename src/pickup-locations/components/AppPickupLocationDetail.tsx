import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { AppActivityCard } from "#/audit";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useAppToast } from "#/hooks/use-app-toast";
import { queryKeys } from "#/lib/query-keys";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useOperatorDateTime } from "#/tour-operator";
import { formatTime } from "../format";
import { usePickupLocation } from "../hooks/use-pickup-location";
import { usePickupLocationActions } from "../hooks/use-pickup-location-actions";

// Pickup-location detail: the meeting point's facts + Edit and Delete actions
// (delete is destructive-confirmed; pickups are a standalone catalog today, so
// deleting one affects nothing else). Owns its fetch (skeleton / 404). The
// list's name column links here.
export const AppPickupLocationDetail = ({
	tourOperatorId,
	pickupLocationId,
}: {
	tourOperatorId: string;
	pickupLocationId: string;
}) => {
	const { formatDate } = useOperatorDateTime();
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
			loading={
				<Card>
					<CardContent className="grid grid-cols-2 gap-4">
						{["a", "b"].map((k) => (
							<Skeleton key={k} className="h-12 w-full" />
						))}
					</CardContent>
				</Card>
			}
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
							actions={<AppPageActions actions={actions} />}
						/>
						<Card>
							<CardContent>
								<dl className="grid grid-cols-2 gap-4">
									<AppDetailField label={m.time()}>
										{formatTime(pickup.time)}
									</AppDetailField>
									<AppDetailField label={m.created()}>{created}</AppDetailField>
								</dl>
							</CardContent>
						</Card>
						<AppActivityCard
							tourOperatorId={tourOperatorId}
							entityType="PICKUP_LOCATION"
							entityId={pickupLocationId}
						/>
					</>
				);
			}}
		</AppResourceView>
	);
};
