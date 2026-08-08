import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { FieldDescription, FieldGroup } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Skeleton } from "#/components/ui/skeleton";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { useCurrencies, useTimezones } from "#/reference";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppConfirmDialog } from "#/shared/components/AppConfirmDialog";
import { AppDetailField } from "#/shared/components/AppDetailField";
import { EmptyValue } from "#/shared/components/EmptyValue";
import {
	useOperatorDetails,
	useOperatorDetailsForm,
} from "../hooks/use-operator-details";
import type { TourOperatorDetails } from "../types";
import { operatorDetailsSchema } from "../validators/operator-details";

// The shop's own record: name, address, contact details, timezone and currency.
// Everything here was set at onboarding and, until now, could not be changed.
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
				{query.isPending || !query.data ? (
					<div className="flex flex-col gap-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				) : canWrite ? (
					<DetailsForm tourOperatorId={tourOperatorId} operator={query.data} />
				) : (
					<DetailsSummary operator={query.data} />
				)}
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
		<AppDetailField label={m.address()}>{operator.address}</AppDetailField>
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
	const { save, errorMessage } = useOperatorDetailsForm(tourOperatorId);

	const [fields, setFields] = useState({
		name: operator.name,
		address: operator.address,
		phone: operator.phone ?? "",
		email: operator.email ?? "",
		timezoneId: operator.timezoneId,
		currencyId: operator.currencyId,
	});
	const [fieldError, setFieldError] = useState<string | null>(null);
	const [confirmZone, setConfirmZone] = useState(false);

	const set = (key: keyof typeof fields) => (value: string) =>
		setFields((f) => ({ ...f, [key]: value }));

	const submit = () => {
		const parsed = operatorDetailsSchema.safeParse(fields);
		if (!parsed.success) {
			setFieldError(parsed.error.issues[0]?.message ?? m.error());
			return;
		}
		setFieldError(null);
		// Moving the timezone reinterprets every departure already stored — slots
		// hold operator-local wall-clock times, so a 10:00 sailing stays "10:00"
		// and silently means a different instant. The backend allows it and does
		// not rewrite those rows, so the confirmation is the only warning there is.
		if (parsed.data.timezoneId !== operator.timezoneId) {
			setConfirmZone(true);
			return;
		}
		save.mutate(parsed.data);
	};

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			{(errorMessage || fieldError) && (
				<AppAlert
					variant="destructive"
					title={m.error()}
					description={errorMessage ?? fieldError ?? ""}
				/>
			)}
			<FieldGroup>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="op-name">{m.shop_name()}</Label>
						<Input
							id="op-name"
							value={fields.name}
							maxLength={150}
							onChange={(e) => set("name")(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="op-handle">{m.handle()}</Label>
						<Input id="op-handle" value={operator.handle} readOnly disabled />
						<FieldDescription>{m.operator_handle_fixed()}</FieldDescription>
					</div>
				</div>
				<div className="space-y-2">
					<Label htmlFor="op-address">{m.address()}</Label>
					<Input
						id="op-address"
						value={fields.address}
						maxLength={500}
						onChange={(e) => set("address")(e.target.value)}
					/>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="op-phone">{m.phone()}</Label>
						<Input
							id="op-phone"
							value={fields.phone}
							maxLength={30}
							onChange={(e) => set("phone")(e.target.value)}
						/>
						<FieldDescription>{m.operator_optional_hint()}</FieldDescription>
					</div>
					<div className="space-y-2">
						<Label htmlFor="op-email">{m.email()}</Label>
						<Input
							id="op-email"
							type="email"
							value={fields.email}
							maxLength={320}
							onChange={(e) => set("email")(e.target.value)}
						/>
						<FieldDescription>{m.operator_optional_hint()}</FieldDescription>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="op-timezone">{m.timezone()}</Label>
						<select
							id="op-timezone"
							className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
							value={fields.timezoneId}
							onChange={(e) => set("timezoneId")(e.target.value)}
						>
							{timezones.data?.map((tz) => (
								<option key={tz.id} value={tz.id}>
									{tz.name}
								</option>
							))}
						</select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="op-currency">{m.currency()}</Label>
						<select
							id="op-currency"
							className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
							value={fields.currencyId}
							onChange={(e) => set("currencyId")(e.target.value)}
						>
							{currencies.data?.map((c) => (
								<option key={c.id} value={c.id}>
									{c.code} — {c.name}
								</option>
							))}
						</select>
					</div>
				</div>
			</FieldGroup>
			<Button type="submit" disabled={save.isPending}>
				{save.isPending && <Spinner />}
				{m.save_changes()}
			</Button>

			<AppConfirmDialog
				open={confirmZone}
				onOpenChange={setConfirmZone}
				title={m.operator_timezone_change_title()}
				description={m.operator_timezone_change_body()}
				confirmLabel={m.operator_timezone_change_confirm()}
				pending={save.isPending}
				onConfirm={() =>
					save.mutate(operatorDetailsSchema.parse(fields), {
						onSuccess: () => setConfirmZone(false),
					})
				}
			/>
		</form>
	);
};
