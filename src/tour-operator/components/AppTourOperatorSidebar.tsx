import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
	SidebarRail,
} from "#/components/ui/sidebar";
import * as m from "#/paraglide/messages";
import { useCurrentTourOperator } from "../hooks/use-current-tour-operator";
import {
	contentNavItems,
	settingsNavItem,
	tourOperatorNavItems,
} from "../nav-items";
import { AppTourOperatorSwitcher } from "./AppTourOperatorSwitcher";
import { SidebarNavLeaf } from "./SidebarNavLeaf";

// The operator workspace sidebar: switcher (header), the feature nav (content),
// and the Settings leaf pinned in the footer. The frame every operator page
// renders beside — see the `$tourOperatorId` layout route.
export const AppTourOperatorSidebar = () => {
	const operator = useCurrentTourOperator();
	const items = operator ? tourOperatorNavItems(operator.id) : [];
	const content = operator ? contentNavItems(operator.id) : [];

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
						{items.map((item) => (
							<SidebarNavLeaf key={item.label} item={item} />
						))}
					</SidebarMenu>
				</SidebarGroup>

				{content.length > 0 && (
					<SidebarGroup>
						<SidebarGroupLabel>{m.content()}</SidebarGroupLabel>
						<SidebarMenu>
							{content.map((item) => (
								<SidebarNavLeaf key={item.label} item={item} />
							))}
						</SidebarMenu>
					</SidebarGroup>
				)}
			</SidebarContent>

			{/* Settings pinned below the scrolling nav (Shopify's placement). */}
			<SidebarFooter>
				<SidebarMenu>
					{operator && <SidebarNavLeaf item={settingsNavItem(operator.id)} />}
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
};
