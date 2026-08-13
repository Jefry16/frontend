import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppAuthShell, getPostLoginPath, useAuth } from "#/auth";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { SelectItem } from "#/components/ui/select";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { useCountries, useCurrencies, useTimezones } from "#/reference";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppComboboxField } from "#/shared/components/AppComboboxField";
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
	const { data: countries = [] } = useCountries();
	const countryOptions = useMemo(
		() => countries.map((c) => ({ value: c.id, label: c.name })),
		[countries],
	);
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const signOut = async () => {
		await logout();
		navigate({ to: "/auth/login" });
	};

	const existingUser = user && user.tourOperators.length > 0 ? user : undefined;
	// Onboarding = a user with no operators yet. Only they see the "wait for an
	// invitation" hint: staff who registered expecting to join someone else's
	// operator shouldn't create their own — they'll be invited by email.
	const isOnboarding = !!user && user.tourOperators.length === 0;

	return (
		<AppAuthShell
			width="lg"
			title={m.create_tour_operator()}
			subtitle={m.create_tour_operator_subtitle()}
		>
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
							<AppAlert title={m.error()} description={errorMessage} />
						)}
						<FieldGroup>
							<form.Field name="name">
								{(field) => <AppField field={field} label={m.name()} />}
							</form.Field>
							<form.Field name="address.address1">
								{(field) => (
									<AppField field={field} label={m.address_line1()} required />
								)}
							</form.Field>
							<form.Field name="address.address2">
								{(field) => (
									<AppField field={field} label={m.address_line2()} />
								)}
							</form.Field>
							<form.Field name="address.city">
								{(field) => (
									<AppField field={field} label={m.city()} required />
								)}
							</form.Field>
							<form.Field name="address.province">
								{(field) => <AppField field={field} label={m.province()} />}
							</form.Field>
							<form.Field name="address.zip">
								{(field) => <AppField field={field} label={m.zip()} />}
							</form.Field>
							<form.Field name="address.countryId">
								{(field) => (
									<AppComboboxField
										field={field}
										label={m.country()}
										items={countryOptions}
										required
									/>
								)}
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
												{t.country.flagUrl && (
													<img
														src={t.country.flagUrl}
														alt=""
														className="h-3.5 w-5 shrink-0 rounded-xs object-cover"
													/>
												)}
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
			{isOnboarding && (
				<>
					<AppAlert
						variant="info"
						className="mt-4"
						title={m.join_existing_team_title()}
						description={m.join_existing_team_body()}
					/>
					{/* The onboarding user has no shell (and no operator to go back
					    to), so this is their only exit off the create page. */}
					<div className="mt-4 flex justify-center">
						<Button type="button" variant="ghost" onClick={signOut}>
							{m.sign_out()}
						</Button>
					</div>
				</>
			)}
		</AppAuthShell>
	);
};
