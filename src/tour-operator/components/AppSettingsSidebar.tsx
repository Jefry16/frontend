import { ArrowLeft } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from "#/components/ui/sidebar";
import * as m from "#/paraglide/messages";
import { AppLink } from "#/shared/components/AppLink";
import { useCurrentTourOperator } from "../hooks/use-current-tour-operator";
import { settingsSectionItems } from "../nav-items";
import { SidebarNavLeaf } from "./SidebarNavLeaf";

// The settings space's own rail (Shopify's model): under /settings/* the operator
// sidebar is swapped for this — a back-to-app header plus the grouped section
// list. Same Sidebar primitives as the operator shell, so look, active states,
// and mobile collapse all match. The swap itself lives in the layout route.
export const AppSettingsSidebar = () => {
	const operator = useCurrentTourOperator();
	const sections = operator ? settingsSectionItems(operator.id) : [];

	return (
		<Sidebar variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild className="font-semibold">
							{operator ? (
								<AppLink
									to="/tour-operators/$tourOperatorId"
									params={{ tourOperatorId: operator.id }}
								>
									<ArrowLeft />
									<span>{m.settings()}</span>
								</AppLink>
							) : (
								<span>{m.settings()}</span>
							)}
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent role="navigation" aria-label={m.settings_navigation()}>
				<SidebarGroup>
					<SidebarMenu>
						{sections.map((item) => (
							<SidebarNavLeaf key={item.label} item={item} />
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
};
