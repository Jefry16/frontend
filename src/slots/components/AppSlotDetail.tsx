import {
	type AppAction,
	AppBadge,
	AppCard,
	AppDetailField,
	AppDetailSkeleton,
	AppPageActions,
	AppPageHeader,
	AppResourceView,
	AppStaticTable,
	type AppStaticTableColumn,
} from "@vointika/ui";
import { Ban, CalendarDays, Pencil } from "lucide-react";
import { useState } from "react";
import { AppActivityCard } from "#/audit";
import * as m from "#/paraglide/messages";
import { getLocale } from "#/paraglide/runtime";
import { useOperatorCurrency, usePermissions } from "#/session";
import { audiencePriceColumns } from "#/shared/audience-price-columns";
import { AppBackLink, AppBreadcrumb, AppResourceLink } from "#/shared/links";
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
import type { SlotAudiencePrice } from "../types";
import { AppEditCapacityDialog } from "./AppEditCapacityDialog";

const tierColumns = (
	currency: string | null,
	locale: string,
): AppStaticTableColumn<SlotAudiencePrice>[] => [
	...audiencePriceColumns<SlotAudiencePrice>(currency, locale),
	{
		id: "capacity",
		header: m.capacity(),
		cell: (tier) => tier.capacity,
		numeric: true,
	},
	{
		id: "booked",
		header: m.booked(),
		cell: (tier) => tier.bookedCount,
		numeric: true,
	},
];

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

						<AppCard className="flex flex-col gap-4">
							<div className="flex flex-wrap gap-2">
								<AppBadge variant={slotStatusBadgeVariant(slot.status)}>
									{formatSlotStatus(slot.status)}
								</AppBadge>
							</div>
							<dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
								<AppDetailField label={m.experience()}>
									<AppResourceLink
										to="/tour-operators/$tourOperatorId/experiences/$experienceId"
										params={{
											tourOperatorId,
											experienceId: slot.experienceId,
										}}
									>
										{slot.experienceName}
									</AppResourceLink>
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
						</AppCard>

						<AppCard title={m.pricing()}>
							<AppStaticTable
								columns={tierColumns(currency, getLocale())}
								rows={slot.audiencePrices}
								rowKey={(tier) => tier.audienceId}
							/>
						</AppCard>

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
