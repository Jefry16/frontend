import { useMatchRoute } from "@tanstack/react-router";
import { SidebarMenuButton, SidebarMenuItem } from "#/components/ui/sidebar";
import { AppLink } from "#/shared/components/AppLink";
import type { NavLeaf } from "../nav-items";

// One nav leaf: a sidebar button wrapping an AppLink, active when the current
// route matches its link (exact for the dashboard, prefix otherwise). Shared by
// the operator sidebar's feature nav and the settings rail's sections.
//
// `isActive` only reaches the DOM as shadcn's `data-active`, which is a styling
// hook — so the current page was shown but never announced, and every leaf read
// alike to a screen reader. `aria-current` is what says it out loud; it goes on
// the link rather than the button because the button is vendored (R1).
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
