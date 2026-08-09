import { useMatchRoute } from "@tanstack/react-router";
import { SidebarMenuButton, SidebarMenuItem } from "#/components/ui/sidebar";
import { AppLink } from "#/shared/components/AppLink";
import type { NavLeaf } from "../nav-items";

// `isActive` reaches the DOM only as shadcn's `data-active`, which styles but
// announces nothing — `aria-current` is what says it out loud. It goes on the
// link, not the button, because the button is vendored (R1).
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
