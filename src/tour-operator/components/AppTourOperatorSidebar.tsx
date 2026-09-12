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
} from "@vointika/ui";
import * as m from "#/paraglide/messages";
import { useCurrentTourOperator } from "#/session";
import {
	catalogNavItems,
	contentNavItems,
	operationsNavItems,
	settingsNavItem,
	tourOperatorNavItems,
} from "../nav-items";
import { AppSignOutButton } from "./AppSignOutButton";
import { AppTourOperatorSwitcher } from "./AppTourOperatorSwitcher";
import { SidebarNavLeaf } from "./SidebarNavLeaf";

export const AppTourOperatorSidebar = () => {
	const operator = useCurrentTourOperator();
	const items = operator ? tourOperatorNavItems(operator.id) : [];
	const catalog = operator ? catalogNavItems(operator.id) : [];
	const operations = operator ? operationsNavItems(operator.id) : [];
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

			<SidebarContent role="navigation" aria-label={m.main_navigation()}>
				<SidebarGroup>
					<SidebarMenu>
						{items.map((item) => (
							<SidebarNavLeaf key={item.label} item={item} />
						))}
					</SidebarMenu>
				</SidebarGroup>

				{catalog.length > 0 && (
					<SidebarGroup>
						<SidebarGroupLabel>{m.catalog()}</SidebarGroupLabel>
						<SidebarMenu>
							{catalog.map((item) => (
								<SidebarNavLeaf key={item.label} item={item} />
							))}
						</SidebarMenu>
					</SidebarGroup>
				)}

				{operations.length > 0 && (
					<SidebarGroup>
						<SidebarGroupLabel>{m.operations()}</SidebarGroupLabel>
						<SidebarMenu>
							{operations.map((item) => (
								<SidebarNavLeaf key={item.label} item={item} />
							))}
						</SidebarMenu>
					</SidebarGroup>
				)}

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

			{/* Settings pinned below the scrolling nav (Shopify's placement), with
			    sign-out under it until an account menu exists to hold it. */}
			<SidebarFooter>
				<SidebarMenu>
					{operator && <SidebarNavLeaf item={settingsNavItem(operator.id)} />}
					<AppSignOutButton />
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
};
