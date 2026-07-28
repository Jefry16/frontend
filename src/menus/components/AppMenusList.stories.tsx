import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { MenuListItem } from "../types";
import { AppMenusList } from "./AppMenusList";

const OP = "op-1";

const MENUS: MenuListItem[] = [
	{
		id: "m-1",
		context: "menus",
		handle: "main-menu",
		title: "Main menu",
		createdAt: "2026-07-28T10:00:00Z",
	},
	{
		id: "m-2",
		context: "menus",
		handle: "footer",
		title: "Footer",
		createdAt: "2026-07-28T10:00:00Z",
	},
];

const qc = storyQueryClient((qc) =>
	qc.setQueryData(
		[...queryKeys.menus(OP), `/tour-operators/${OP}/menus`, [], [], undefined],
		listPage(MENUS),
	),
);

const meta = {
	title: "Menus/AppMenusList",
	component: AppMenusList,
	args: { tourOperatorId: OP },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<Story />
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMenusList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
