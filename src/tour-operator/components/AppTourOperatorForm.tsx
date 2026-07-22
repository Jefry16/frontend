import { useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { getPostLoginPath, useAuth } from "#/auth";
import { Alert, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { SelectItem } from "#/components/ui/select";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { useCurrencies, useTimezones } from "#/reference";
import { AppField } from "#/shared/components/AppField";
import { AppSelectField } from "#/shared/components/AppSelectField";
import { useTourOperatorForm } from "../hooks/use-tour-operator-form";

// Onboarding form (`/tour-operators/new`). Create-only: name/address + the
// immutable currency + timezone. A user who already has an operator gets an
// explicit way back out so they're not stranded here.
export const AppTourOperatorForm = () => {
	const { form, isPending, errorMessage } = useTourOperatorForm();
	const { data: currencies = [] } = useCurrencies();
	const { data: timezones = [] } = useTimezones();
	const { user } = useAuth();
	const navigate = useNavigate();

	const existingUser = user && user.tourOperators.length > 0 ? user : undefined;

	return (
		<div className="w-full max-w-lg">
			<div className="mb-6 flex flex-col items-center gap-1 text-center">
				<img src="/vointika-logo.svg" alt="Vointika" className="mb-2 h-28" />
				<h1 className="text-xl font-semibold tracking-tight">
					{m.create_tour_operator()}
				</h1>
				<p className="text-sm text-muted-foreground">
					{m.create_tour_operator_subtitle()}
				</p>
			</div>
			<Card>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
						className="space-y-4"
					>
						{errorMessage && (
							<Alert className="text-destructive *:data-[slot=alert-description]:text-destructive/90">
								<CircleAlert />
								<AlertTitle>{m.error()}</AlertTitle>
								<AlertDescription>{errorMessage}</AlertDescription>
							</Alert>
						)}
						<FieldGroup>
							<form.Field name="name">
								{(field) => <AppField field={field} label={m.name()} />}
							</form.Field>
							<form.Field name="address">
								{(field) => <AppField field={field} label={m.address()} />}
							</form.Field>
							<form.Field name="currencyId">
								{(field) => (
									<AppSelectField
										field={field}
										label={m.currency()}
										placeholder={m.select_option()}
									>
										{currencies.map((c) => (
											<SelectItem key={c.id} value={c.id}>
												{c.code} — {c.name}
											</SelectItem>
										))}
									</AppSelectField>
								)}
							</form.Field>
							<form.Field name="timezoneId">
								{(field) => (
									<AppSelectField
										field={field}
										label={m.timezone()}
										placeholder={m.select_option()}
									>
										{timezones.map((t) => (
											<SelectItem key={t.id} value={t.id}>
												<img
													src={t.country.flagUrl}
													alt=""
													className="h-3.5 w-5 shrink-0 rounded-xs object-cover"
												/>
												<span>
													{t.cityName}, {t.country.name}
												</span>
											</SelectItem>
										))}
									</AppSelectField>
								)}
							</form.Field>
						</FieldGroup>
						<Button type="submit" disabled={isPending} className="w-full">
							{isPending && <Spinner />}
							{m.create()}
						</Button>
					</form>
					{existingUser && (
						<div className="mt-4 flex justify-center">
							<Button
								type="button"
								variant="ghost"
								onClick={() => navigate({ to: getPostLoginPath(existingUser) })}
							>
								{m.cancel()}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};
