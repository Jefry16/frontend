import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { SelectItem } from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
import * as m from "#/paraglide/messages";
import { useCountries, useCurrencies, useTimezones } from "#/reference";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppCardBody } from "#/shared/components/AppCardBody";
import { AppConfirmDialog } from "#/shared/components/AppConfirmDialog";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { AppField } from "#/shared/components/AppField";
import { AppFormActions } from "#/shared/components/AppFormActions";
import { AppSelectField } from "#/shared/components/AppSelectField";
import { EmptyValue } from "#/shared/components/EmptyValue";
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

export const AppOperatorDetailsCard = ({
	tourOperatorId,
	canWrite,
}: {
	tourOperatorId: string;
	canWrite: boolean;
}) => {
	const query = useOperatorDetails(tourOperatorId);

	return (
		<Card>
			<CardHeader>
				<CardTitle>{m.operator_details()}</CardTitle>
				<CardDescription>{m.operator_details_description()}</CardDescription>
			</CardHeader>
			<CardContent>
				<AppCardBody
					query={query}
					loading={
						<div className="flex flex-col gap-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					}
				>
					{(operator) =>
						canWrite ? (
							<DetailsForm
								tourOperatorId={tourOperatorId}
								operator={operator}
							/>
						) : (
							<DetailsSummary operator={operator} />
						)
					}
				</AppCardBody>
			</CardContent>
		</Card>
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
	const { data: countries = [] } = useCountries();
	const timezones = useTimezones();
	const currencies = useCurrencies();
	const { form, isPending, errorMessage, submit } = useOperatorDetailsForm(
		tourOperatorId,
		operator,
	);
	const [confirmZone, setConfirmZone] =
		useState<OperatorDetailsFormData | null>(null);

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
				// Moving the timezone reinterprets every stored departure: slots hold
				// operator-local wall-clock times, so a 10:00 sailing stays "10:00" and
				// silently means a different instant. The backend rewrites nothing, so
				// this confirmation is the only warning there is.
				const parsed = operatorDetailsSchema.safeParse(form.state.values);
				if (parsed.success && parsed.data.timezoneId !== operator.timezoneId) {
					setConfirmZone(parsed.data);
					return;
				}
				form.handleSubmit();
			}}
		>
			{errorMessage && (
				<AppAlert title={m.error()} description={errorMessage} />
			)}
			<FieldGroup>
				<form.Field name="name">
					{(field) => <AppField field={field} label={m.shop_name()} required />}
				</form.Field>
				<form.Field name="address.address1">
					{(field) => (
						<AppField field={field} label={m.address_line1()} required />
					)}
				</form.Field>
				<form.Field name="address.address2">
					{(field) => (
						<AppField
							field={field}
							label={m.address_line2()}
							description={m.operator_optional_hint()}
						/>
					)}
				</form.Field>
				<form.Field name="address.city">
					{(field) => <AppField field={field} label={m.city()} required />}
				</form.Field>
				<form.Field name="address.province">
					{(field) => (
						<AppField
							field={field}
							label={m.province()}
							description={m.operator_optional_hint()}
						/>
					)}
				</form.Field>
				<form.Field name="address.zip">
					{(field) => (
						<AppField
							field={field}
							label={m.zip()}
							description={m.operator_optional_hint()}
						/>
					)}
				</form.Field>
				<form.Field name="address.countryId">
					{(field) => (
						<AppSelectField
							field={field}
							label={m.country()}
							placeholder={m.select_option()}
						>
							{countries.map((c) => (
								<SelectItem key={c.id} value={c.id}>
									{c.name}
								</SelectItem>
							))}
						</AppSelectField>
					)}
				</form.Field>
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
			<AppFormActions isPending={isPending} submitLabel={m.save_changes()} />

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
		</form>
	);
};
