import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import {
	Sidebar,
	SidebarFooter,
	SidebarMenu,
	SidebarProvider,
} from "#/components/ui/sidebar";
import { storyQueryClient } from "#/dev/story-utils";
import { AppSignOutButton } from "./AppSignOutButton";

const qc = storyQueryClient();

const meta = {
	title: "TourOperator/AppSignOutButton",
	component: AppSignOutButton,
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<SidebarProvider>
						<Sidebar variant="inset">
							<SidebarFooter>
								<SidebarMenu>
									<Story />
								</SidebarMenu>
							</SidebarFooter>
						</Sidebar>
					</SidebarProvider>
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppSignOutButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
