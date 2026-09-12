import { useNavigate } from "@tanstack/react-router";
import { AppAuthShell, getPostLoginPath, useAuth } from "#/auth";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { SelectItem } from "#/components/ui/select";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { useCurrencies, useTimezones } from "#/reference";
import { AppAlert } from "#/shared/components/AppAlert";
import { AppField } from "#/shared/components/AppField";
import { AppSelectField } from "#/shared/components/AppSelectField";
import { useTourOperatorForm } from "../hooks/use-tour-operator-form";
import { AppOperatorAddressFields } from "./AppOperatorAddressFields";

export const AppTourOperatorForm = () => {
	const { form, isPending, errorMessage } = useTourOperatorForm();
	const { data: currencies = [] } = useCurrencies();
	const { data: timezones = [] } = useTimezones();
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const signOut = async () => {
		await logout();
		navigate({ to: "/auth/login" });
	};

	const existingUser = user && user.tourOperators.length > 0 ? user : undefined;
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
						{errorMessage && <AppAlert description={errorMessage} />}
						<FieldGroup>
							<form.Field name="name">
								{(field) => <AppField field={field} label={m.name()} />}
							</form.Field>
							<AppOperatorAddressFields form={form} />
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
