import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Menu } from "../types";
import { AppMenuDetail } from "./AppMenuDetail";

const OP = "op-1";
const MENU_ID = "m-1";

const MENU: Menu = {
	id: MENU_ID,
	context: "menus",
	handle: "main-menu",
	title: "Main menu",
	items: [
		{
			id: "i-1",
			title: "Home",
			linkType: "HOME",
			resourceId: null,
			url: null,
			titleTranslations: { es: "Inicio" },
			children: [],
		},
		{
			id: "i-2",
			title: "Explore",
			linkType: "EXPERIENCE_LIST",
			resourceId: null,
			url: null,
			titleTranslations: {},
			children: [
				{
					id: "i-3",
					title: "Sunset Sailing Tour",
					linkType: "EXPERIENCE",
					resourceId: "e-1",
					url: null,
					titleTranslations: {},
					children: [],
				},
			],
		},
		{
			id: "i-4",
			title: "Blog",
			linkType: "EXTERNAL_URL",
			resourceId: null,
			url: "https://example.com/blog",
			titleTranslations: {},
			children: [],
		},
	],
	createdAt: "2026-07-28T10:00:00Z",
	updatedAt: "2026-07-28T10:00:00Z",
};

const qc = storyQueryClient((qc) => {
	qc.setQueryData(queryKeys.menu(OP, MENU_ID), MENU);
	qc.setQueryData(
		queryKeys.activityTimeline(OP, "MENU", MENU_ID),
		listPage([]),
	);
});

const meta = {
	title: "Menus/AppMenuDetail",
	component: AppMenuDetail,
	args: { tourOperatorId: OP, menuId: MENU_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<div className="mx-auto w-full max-w-3xl">
						<Story />
					</div>
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMenuDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
