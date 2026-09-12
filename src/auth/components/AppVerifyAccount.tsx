import { Spinner } from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/components/AppLink";
import type { VerifyState } from "../verify-token";
import { AppAuthMessageCard } from "./AppAuthMessageCard";

export const AppVerifyAccount = ({ state }: { state: VerifyState }) => {
	if (state === "verifying") {
		return (
			<AppAuthMessageCard
				icon={<Spinner />}
				description={m.verifying_email()}
			/>
		);
	}

	if (state === "success") {
		return (
			<AppAuthMessageCard
				tone="success"
				title={m.email_verified_title()}
				description={m.email_verified_description()}
			>
				<AppLink to="/auth/login">{m.go_to_sign_in()}</AppLink>
			</AppAuthMessageCard>
		);
	}

	return (
		<AppAuthMessageCard
			tone="destructive"
			title={m.verification_failed_title()}
			description={
				state === "missing-token"
					? m.verification_missing_token()
					: m.verification_failed_description()
			}
		>
			<AppLink to="/auth/login">{m.go_to_sign_in()}</AppLink>
		</AppAuthMessageCard>
	);
};
