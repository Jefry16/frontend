import { useMatchRoute } from "@tanstack/react-router";
import { SidebarMenuButton, SidebarMenuItem } from "#/components/ui/sidebar";
import { AppLink } from "#/shared/components/AppLink";
import type { NavLeaf } from "../nav-items";

export const SidebarNavLeaf = ({ item }: { item: NavLeaf }) => {
	const matchRoute = useMatchRoute();
	const isActive = !!matchRoute({ ...item.link, fuzzy: !item.exact });
	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
				<AppLink {...item.link} aria-current={isActive ? "page" : undefined}>
					<item.icon />
					<span>{item.label}</span>
				</AppLink>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
};
