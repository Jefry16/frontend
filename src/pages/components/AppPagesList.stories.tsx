import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { PageListItem } from "../types";
import { AppPagesList } from "./AppPagesList";

const OP_ID = "op-1";

const PAGES: PageListItem[] = [
	{
		id: "p-1",
		context: "pages",
		title: "About us",
		handle: "about-us",
		status: "PUBLISHED",
		createdAt: "2026-07-20T10:00:00Z",
		updatedAt: "2026-07-25T10:00:00Z",
	},
	{
		id: "p-2",
		context: "pages",
		title: "Contact",
		handle: "contact",
		status: "DRAFT",
		createdAt: "2026-07-22T09:00:00Z",
		updatedAt: "2026-07-22T09:00:00Z",
	},
];

const qc = storyQueryClient((qc) =>
	qc.setQueryData(
		[
			...queryKeys.pages(OP_ID),
			`/tour-operators/${OP_ID}/pages`,
			[],
			[],
			undefined,
		],
		listPage(PAGES),
	),
);

const meta = {
	title: "Pages/AppPagesList",
	component: AppPagesList,
	args: { tourOperatorId: OP_ID },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<Story />
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppPagesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
