import { Link } from "@tanstack/react-router";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import type { VerifyState } from "../verify-token";
import { AppAuthMessageCard } from "./AppAuthMessageCard";

// Presentational: renders the verification outcome. The verify request runs in
// the /auth/verify route loader (once per navigation); this just shows `state`.
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
				<Link to="/auth/login">{m.go_to_sign_in()}</Link>
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
			<Link to="/auth/login">{m.go_to_sign_in()}</Link>
		</AppAuthMessageCard>
	);
};
