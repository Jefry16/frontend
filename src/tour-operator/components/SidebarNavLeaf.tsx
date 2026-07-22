import { useMatchRoute } from "@tanstack/react-router";
import { SidebarMenuButton, SidebarMenuItem } from "#/components/ui/sidebar";
import { AppLink } from "#/shared/components/AppLink";
import type { NavLeaf } from "../nav-items";

// One nav leaf: a sidebar button wrapping an AppLink, active when the current
// route matches its link (exact for the dashboard, prefix otherwise). Shared by
// the operator sidebar's feature nav and the settings rail's sections.
export const SidebarNavLeaf = ({ item }: { item: NavLeaf }) => {
	const matchRoute = useMatchRoute();
	const isActive = !!matchRoute({ ...item.link, fuzzy: !item.exact });
	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
				<AppLink {...item.link}>
					<item.icon />
					<span>{item.label}</span>
				</AppLink>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
};
