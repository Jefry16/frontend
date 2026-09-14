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
} from "@vointika/ui";
import { ArrowLeft } from "lucide-react";
import * as m from "#/paraglide/messages";
import { useCurrentTourOperator } from "#/session";
import { AppLink } from "#/shared/links";
import { settingsSectionItems } from "../nav-items";
import { AppSignOutButton } from "./AppSignOutButton";
import { SidebarNavLeaf } from "./SidebarNavLeaf";

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

			<SidebarFooter>
				<SidebarMenu>
					<AppSignOutButton />
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
};
