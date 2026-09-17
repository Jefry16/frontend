import { useMatchRoute } from "@tanstack/react-router";
import { SidebarMenuButton, SidebarMenuItem } from "@vointika/ui";
import { AppLink } from "#/shared/links";
import type { NavLeaf } from "../nav-items";

export const SidebarNavLeaf = ({ item }: { item: NavLeaf }) => {
	const matchRoute = useMatchRoute();
	const isActive = !!matchRoute({ ...item.link, fuzzy: !item.exact });
	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={isActive}
				tooltip={item.label}
				className="data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground"
			>
				<AppLink {...item.link} aria-current={isActive ? "page" : undefined}>
					<item.icon />
					<span>{item.label}</span>
				</AppLink>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
};
