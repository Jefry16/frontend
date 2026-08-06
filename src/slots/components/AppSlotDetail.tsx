import { Ban, CalendarDays, Eye, EyeOff, Pencil } from "lucide-react";
import { useState } from "react";
import { AppActivityCard } from "#/audit";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "#/shared/components/AppBackLink";
import { AppBadge } from "#/shared/components/AppBadge";
import { AppBreadcrumb } from "#/shared/components/AppBreadcrumb";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppLink } from "#/shared/components/AppLink";
import {
	type AppAction,
	AppPageActions,
} from "#/shared/components/AppPageActions";
import { AppPageHeader } from "#/shared/components/AppPageHeader";
import { AppResourceView } from "#/shared/components/AppResourceView";
import { usePermissions } from "#/tour-operator";
import {
	formatBookedCapacity,
	formatDayName,
	formatSlotDateTime,
	formatSlotDuration,
	formatSlotPrice,
	formatSlotStatus,
	slotStatusBadgeVariant,
} from "../format";
import { useSlot } from "../hooks/use-slot";
import { useSlotActions } from "../hooks/use-slot-actions";
import { AppEditCapacityDialog } from "./AppEditCapacityDialog";

// The departure detail: schedule facts + the per-tier pricing table, with the
// slot actions — edit capacity (dialog), mark sold out / available, and cancel
// (terminal, destructive confirm). A cancelled slot offers no actions.
export const AppSlotDetail = ({
	tourOperatorId,
	slotId,
}: {
	tourOperatorId: string;
	slotId: string;
}) => {
	const query = useSlot(tourOperatorId, slotId);
	const { cancel, setStatus, setCapacities } = useSlotActions(
		tourOperatorId,
		slotId,
	);
	const [capacityOpen, setCapacityOpen] = useState(false);

	const backLink = (
		<AppBackLink
			to="/tour-operators/$tourOperatorId/availability"
			params={{ tourOperatorId }}
		>
			{m.back_to_availability()}
		</AppBackLink>
	);

	const { canWrite } = usePermissions();

	return (
		<AppResourceView
			query={query}
			resource={m.availability()}
			icon={CalendarDays}
			breadcrumb={
				<AppBreadcrumb
					items={[{ label: m.catalog() }, { label: m.availability() }]}
				/>
			}
			notFoundAction={backLink}
			loading={
				<Card>
					<CardContent className="grid grid-cols-2 gap-4">
						{["a", "b", "c", "d"].map((k) => (
							<Skeleton key={k} className="h-12 w-full" />
						))}
					</CardContent>
				</Card>
			}
		>
			{(slot) => {
				const cancelled = slot.status === "CANCELLED";
				const actions: AppAction[] = cancelled
					? []
					: [
							{
								id: "capacity",
								label: m.edit_capacity(),
								icon: Pencil,
								onSelect: () => setCapacityOpen(true),
							},
							slot.status === "AVAILABLE"
								? {
										id: "sold-out",
										label: m.mark_sold_out(),
										icon: EyeOff,
										pending: setStatus.isPending,
										onSelect: () => setStatus.mutate("SOLD_OUT"),
									}
								: {
										id: "available",
										label: m.mark_available(),
										icon: Eye,
										pending: setStatus.isPending,
										onSelect: () => setStatus.mutate("AVAILABLE"),
									},
							{
								id: "cancel",
								label: m.cancel_slot(),
								icon: Ban,
								variant: "destructive",
								pending: cancel.isPending,
								confirm: {
									title: m.cancel_slot_title(),
									description: m.cancel_slot_body(),
									confirmLabel: m.cancel_slot(),
								},
								onSelect: () => cancel.mutate(),
							},
						];

				return (
					<>
						<AppPageHeader
							title={slot.experienceName}
							description={formatSlotDateTime(slot.startAt)}
							breadcrumb={
								<AppBreadcrumb
									items={[
										{ label: m.catalog() },
										{
											label: m.availability(),
											to: "/tour-operators/$tourOperatorId/availability",
											params: { tourOperatorId },
										},
										{ label: formatSlotDateTime(slot.startAt) },
									]}
								/>
							}
							actions={<AppPageActions actions={canWrite ? actions : []} />}
						/>

						<Card>
							<CardContent className="flex flex-col gap-4">
								<div className="flex flex-wrap gap-2">
									<AppBadge variant={slotStatusBadgeVariant(slot.status)}>
										{formatSlotStatus(slot.status)}
									</AppBadge>
								</div>
								<dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
									<AppDetailField label={m.experience()}>
										<AppLink
											to="/tour-operators/$tourOperatorId/experiences/$experienceId"
											params={{
												tourOperatorId,
												experienceId: slot.experienceId,
											}}
											className="text-info hover:underline"
										>
											{slot.experienceName}
										</AppLink>
									</AppDetailField>
									<AppDetailField label={m.starts()}>
										{formatSlotDateTime(slot.startAt)}
									</AppDetailField>
									<AppDetailField label={m.ends()}>
										{formatSlotDateTime(slot.endAt)}
									</AppDetailField>
									<AppDetailField label={m.duration()}>
										{formatSlotDuration(slot.durationMinutes)}
									</AppDetailField>
									<AppDetailField label={m.day()}>
										{formatDayName(slot.day)}
									</AppDetailField>
									<AppDetailField label={m.booked()}>
										{formatBookedCapacity(slot.audiencePrices)}
									</AppDetailField>
								</dl>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{m.pricing()}</CardTitle>
							</CardHeader>
							<CardContent>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{m.audience()}</TableHead>
											<TableHead className="text-right">{m.price()}</TableHead>
											<TableHead className="text-right">
												{m.capacity()}
											</TableHead>
											<TableHead className="text-right">{m.booked()}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{slot.audiencePrices.map((tier) => (
											<TableRow key={tier.audienceId}>
												<TableCell>{tier.audienceName}</TableCell>
												<TableCell className="text-right tabular-nums">
													{formatSlotPrice(tier.price)}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{tier.capacity}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{tier.bookedCount}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>

						<AppActivityCard
							tourOperatorId={tourOperatorId}
							entityType="SLOT"
							entityId={slotId}
						/>

						<AppEditCapacityDialog
							open={capacityOpen}
							onOpenChange={setCapacityOpen}
							tiers={slot.audiencePrices}
							pending={setCapacities.isPending}
							onSave={(capacities) =>
								setCapacities.mutate(capacities, {
									onSuccess: () => setCapacityOpen(false),
								})
							}
						/>
					</>
				);
			}}
		</AppResourceView>
	);
};
