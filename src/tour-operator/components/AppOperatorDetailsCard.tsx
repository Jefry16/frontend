import {
	AppConfirmDialog,
	AppDetailField,
	AppField,
	AppForm,
	AppFormActions,
	AppFormSkeleton,
	AppQueryState,
	AppSelectField,
	AppSettingsCard,
	EmptyValue,
	FieldGroup,
	SelectItem,
} from "@vointika/ui";
import { useState } from "react";
import * as m from "#/paraglide/messages";
import { useCurrencies, useTimezones } from "#/reference";
import { addressLines } from "../format";
import {
	useOperatorDetails,
	useOperatorDetailsForm,
} from "../hooks/use-operator-details";
import type { TourOperatorDetails } from "../types";
import {
	type OperatorDetailsFormData,
	operatorDetailsSchema,
} from "../validators/operator-details";
import { AppOperatorAddressFields } from "./AppOperatorAddressFields";

export const AppOperatorDetailsCard = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	canWrite: boolean;
}) => {
	const query = useOperatorDetails(tourOperatorId);

	return (
		<AppSettingsCard
			title={m.operator_details()}
			description={m.operator_details_description()}
		>
			<AppQueryState
				query={query}
				loading={<AppFormSkeleton rows={4} card={false} />}
			>
				{(operator) =>
					canWrite ? (
						<DetailsForm tourOperatorId={tourOperatorId} operator={operator} />
					) : (
						<DetailsSummary operator={operator} />
					)
				}
			</AppQueryState>
		</AppSettingsCard>
	);
};

const DetailsSummary = ({ operator }: { operator: TourOperatorDetails }) => (
	<dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<AppDetailField label={m.shop_name()}>{operator.name}</AppDetailField>
		<AppDetailField label={m.handle()}>
			<span className="font-mono text-sm">{operator.handle}</span>
		</AppDetailField>
		<AppDetailField label={m.address()}>
			{addressLines(operator.address).map((line) => (
				<div key={line}>{line}</div>
			))}
		</AppDetailField>
		<AppDetailField label={m.phone()}>
			{operator.phone ?? <EmptyValue />}
		</AppDetailField>
		<AppDetailField label={m.email()}>
			{operator.email ?? <EmptyValue />}
		</AppDetailField>
	</dl>
);

const DetailsForm = ({
	tourOperatorId,
	operator,
}: {
	tourOperatorId: string;
	operator: TourOperatorDetails;
}) => {
	const timezones = useTimezones();
	const currencies = useCurrencies();
	const { form, isPending, errorMessage, submit } = useOperatorDetailsForm(
		tourOperatorId,
		operator,
	);
	const [confirmZone, setConfirmZone] =
		useState<OperatorDetailsFormData | null>(null);

	return (
		<AppForm
			onSubmit={() => {
				const parsed = operatorDetailsSchema.safeParse(form.state.values);
				if (parsed.success && parsed.data.timezoneId !== operator.timezoneId) {
					setConfirmZone(parsed.data);
					return;
				}
				form.handleSubmit();
			}}
			errorMessage={errorMessage}
			actions={
				<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />
			}
		>
			<FieldGroup>
				<form.Field name="name">
					{(field) => <AppField field={field} label={m.shop_name()} required />}
				</form.Field>
				<AppOperatorAddressFields form={form} />
				<form.Field name="phone">
					{(field) => (
						<AppField
							field={field}
							label={m.phone()}
							description={m.operator_optional_hint()}
						/>
					)}
				</form.Field>
				<form.Field name="email">
					{(field) => (
						<AppField
							field={field}
							label={m.email()}
							type="email"
							description={m.operator_optional_hint()}
						/>
					)}
				</form.Field>
				<form.Field name="timezoneId">
					{(field) => (
						<AppSelectField
							field={field}
							label={m.timezone()}
							required
							placeholder={m.select_option()}
						>
							{timezones.data?.map((tz) => (
								<SelectItem key={tz.id} value={tz.id}>
									{tz.name}
								</SelectItem>
							))}
						</AppSelectField>
					)}
				</form.Field>
				<form.Field name="currencyId">
					{(field) => (
						<AppSelectField
							field={field}
							label={m.currency()}
							required
							placeholder={m.select_option()}
						>
							{currencies.data?.map((c) => (
								<SelectItem key={c.id} value={c.id}>
									{c.code} — {c.name}
								</SelectItem>
							))}
						</AppSelectField>
					)}
				</form.Field>
			</FieldGroup>
			<AppConfirmDialog
				open={confirmZone !== null}
				onOpenChange={(open) => {
					if (!open) setConfirmZone(null);
				}}
				title={m.operator_timezone_change_title()}
				description={m.operator_timezone_change_body()}
				confirmLabel={m.operator_timezone_change_confirm()}
				pending={isPending}
				onConfirm={() => {
					if (confirmZone)
						submit(confirmZone, { onSuccess: () => setConfirmZone(null) });
				}}
			/>
		</AppForm>
	);
};
