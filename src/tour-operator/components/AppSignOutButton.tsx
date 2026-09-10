import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "#/auth";
import { SidebarMenuButton, SidebarMenuItem } from "#/components/ui/sidebar";
import * as m from "#/paraglide/messages";

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
