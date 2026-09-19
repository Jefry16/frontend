import { Button, Spinner } from "@vointika/ui";
import { MailCheck } from "lucide-react";
import { useEffect, useState } from "react";
import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/links";
import { useResendVerification } from "../hooks/use-resend-verification";
import { AppAuthMessageCard } from "./AppAuthMessageCard";

const COOLDOWN_SECONDS = 30;

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
			icon={<MailCheck className="size-8 text-muted-foreground" />}
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
