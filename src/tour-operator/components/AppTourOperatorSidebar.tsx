import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "#/auth";
import { Avatar, AvatarFallback } from "#/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "#/components/ui/sidebar";
import * as m from "#/paraglide/messages";
import { useTheme } from "#/shared/theme";
import { useCurrentTourOperator } from "../hooks/use-current-tour-operator";
import { tourOperatorNavItems } from "../nav-items";
import { AppTourOperatorSwitcher } from "./AppTourOperatorSwitcher";

// The operator workspace sidebar: switcher (header), the feature nav (content),
// and the signed-in user's menu (footer). The frame every operator page renders
// beside — see the `$tourOperatorId` layout route.
export const AppTourOperatorSidebar = () => {
	const operator = useCurrentTourOperator();
	const matchRoute = useMatchRoute();
	const items = operator ? tourOperatorNavItems(operator.id) : [];

	return (
		<Sidebar variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						{operator && <AppTourOperatorSwitcher activeId={operator.id} />}
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						{items.map((item) => {
							const isActive = !!matchRoute({
								...item.link,
								fuzzy: !item.exact,
							});
							return (
								<SidebarMenuItem key={item.label}>
									<SidebarMenuButton
										asChild
										isActive={isActive}
										tooltip={item.label}
									>
										<Link {...item.link}>
											<item.icon />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<AppUserMenu />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
};

// The signed-in user's menu in the sidebar footer: name + a dropdown with the
// theme toggle and sign out. Kept local — it's used once (R2).
function AppUserMenu() {
	const { user, logout } = useAuth();
	const { theme, toggle } = useTheme();
	const navigate = useNavigate();

	const signOut = async () => {
		await logout();
		navigate({ to: "/auth/login" });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarMenuButton size="lg" tooltip={user?.name}>
					<Avatar size="sm">
						<AvatarFallback>
							{user?.name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="truncate font-medium">{user?.name}</span>
					<ChevronsUpDown className="ml-auto size-4 opacity-60" />
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				side="top"
				sideOffset={4}
				className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
			>
				<DropdownMenuItem onSelect={() => toggle()}>
					{theme === "dark" ? (
						<Sun className="size-4" />
					) : (
						<Moon className="size-4" />
					)}
					<span>{m.toggle_theme()}</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={signOut}>
					<LogOut className="size-4" />
					<span>{m.sign_out()}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
