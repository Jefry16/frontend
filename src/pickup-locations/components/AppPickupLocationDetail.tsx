import { ArrowLeft, MapPin } from "lucide-react";
import { Card, CardContent } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppLink } from "#/shared/components/AppLink";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { useCurrentTourOperator } from "#/tour-operator";
import { formatTime } from "../format";
import { usePickupLocation } from "../hooks/use-pickup-location";

// Pickup-location detail: the meeting point's facts. Owns its fetch
// (skeleton / 404). Mutating actions land as a later slice. The list's name
// column links here.
export const AppPickupLocationDetail = ({
	tourOperatorId,
	pickupLocationId,
}: {
	tourOperatorId: string;
	pickupLocationId: string;
}) => {
	const timeZone = useCurrentTourOperator()?.timezone;
	const query = usePickupLocation(tourOperatorId, pickupLocationId);

	const backLink = (
		<AppLink
			to="/tour-operators/$tourOperatorId/pickup-locations"
			params={{ tourOperatorId }}
			className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft className="size-4" />
			{m.back_to_pickup_locations()}
		</AppLink>
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
				const created = new Intl.DateTimeFormat(undefined, {
					dateStyle: "medium",
					timeZone,
				}).format(new Date(pickup.createdAt));
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
					</>
				);
			}}
		</AppResourceView>
	);
};
