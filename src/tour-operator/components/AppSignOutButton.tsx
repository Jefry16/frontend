import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "#/auth";
import { SidebarMenuButton, SidebarMenuItem } from "#/components/ui/sidebar";
import * as m from "#/paraglide/messages";

/**
 * Sign out, pinned in both sidebar footers.
 *
 * A DELIBERATE STOPGAP. Sign-out belongs in an account menu beside the user's
 * name and avatar; until that exists, an operator signed into the app has no
 * way out at all — the only other trigger is on the onboarding screen, which a
 * member of an existing operator never sees. A sidebar row is the least chrome
 * that fixes it, and the least to unpick when the account menu lands.
 *
 * `logout()` clears the token and the session cache but does not navigate, so
 * the caller does — matching AppTourOperatorForm.
 */
export const AppSignOutButton = () => {
	const { logout } = useAuth();
	const navigate = useNavigate();
	const [pending, setPending] = useState(false);

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				disabled={pending}
				tooltip={m.sign_out()}
				onClick={async () => {
					setPending(true);
					await logout();
					navigate({ to: "/auth/login" });
				}}
			>
				<LogOut />
				<span>{m.sign_out()}</span>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
};
