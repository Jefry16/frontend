import {
	type AppAction,
	AppBadge,
	AppDetailField,
	AppDetailSkeleton,
	AppPageActions,
	AppPageHeader,
	AppResourceView,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@vointika/ui";
import { Ban, CalendarDays, Pencil } from "lucide-react";
import { useState } from "react";
import { AppActivityCard } from "#/audit";
import { formatMoney } from "#/lib/money";
import * as m from "#/paraglide/messages";
import { useOperatorCurrency, usePermissions } from "#/session";
import { AppBackLink, AppBreadcrumb, AppLink } from "#/shared/links";
import {
	formatBookedCapacity,
	formatDayName,
	formatSlotDateTime,
	formatSlotDuration,
	formatSlotStatus,
	slotStatusBadgeVariant,
} from "../format";
import { useSlot } from "../hooks/use-slot";
import { useSlotActions } from "../hooks/use-slot-actions";
import { AppEditCapacityDialog } from "./AppEditCapacityDialog";

export const AppSlotDetail = ({
	tourOperatorId,
	slotId,
}: {
	tourOperatorId: string;
	slotId: string;
}) => {
	const query = useSlot(tourOperatorId, slotId);
	const { cancel, setCapacities } = useSlotActions(tourOperatorId, slotId);
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
	const currency = useOperatorCurrency();

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
			loading={<AppDetailSkeleton fields={4} />}
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
							actions={<AppPageActions actions={actions} canWrite={canWrite} />}
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
													{formatMoney(tier.price, currency)}
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
