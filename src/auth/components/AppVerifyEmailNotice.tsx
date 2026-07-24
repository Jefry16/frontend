import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/components/AppLink";
import { useResendVerification } from "../hooks/use-resend-verification";
import { AppAuthMessageCard } from "./AppAuthMessageCard";

// A short cooldown after a resend so the button can't be hammered (the backend
// also throttles). Purely UX — the countdown re-enables it.
const COOLDOWN_SECONDS = 30;

// The post-registration "check your email" screen: confirms where the link was
// sent and offers a resend. Shown after register, and reachable from the login
// "email not verified" path. Anti-enumeration means a resend never confirms the
// address exists — it just re-requests. Falls back to a generic message if the
// email wasn't passed (e.g. deep-linked here).
export const AppVerifyEmailNotice = ({ email }: { email?: string }) => {
	const resend = useResendVerification();
	const [cooldown, setCooldown] = useState(0);

	useEffect(() => {
		if (cooldown <= 0) return;
		const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
		return () => clearTimeout(id);
	}, [cooldown]);

	const onResend = () => {
		if (!email) return;
		resend.mutate(email, { onSuccess: () => setCooldown(COOLDOWN_SECONDS) });
	};

	return (
		<AppAuthMessageCard
			icon={<MailCheck className="size-10 text-primary" />}
			title={m.check_email_title()}
			description={
				email
					? m.check_email_description({ email })
					: m.check_email_description_generic()
			}
		>
			{email && (
				<Button
					type="button"
					variant="outline"
					className="w-full"
					disabled={resend.isPending || cooldown > 0}
					onClick={onResend}
				>
					{resend.isPending && <Spinner className="size-4" />}
					{cooldown > 0
						? m.resend_verification_in({ seconds: cooldown })
						: m.resend_verification()}
				</Button>
			)}
			<AppLink to="/auth/login">{m.back_to_sign_in()}</AppLink>
		</AppAuthMessageCard>
	);
};
