import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { seedTable, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { ContactMessageListItem } from "../types";
import { AppContactMessagesList } from "./AppContactMessagesList";

const OP = "op-1";

const MESSAGES: ContactMessageListItem[] = [
	{
		id: "cm-1",
		context: "contact-messages",
		name: "Laura Pérez",
		email: "laura@example.com",
		summary: "Do you have child seats on the sunset tour?",
		createdAt: "2026-07-28T10:00:00Z",
	},
	{
		id: "cm-2",
		context: "contact-messages",
		name: "Tom Baker",
		email: "tom@example.org",
		summary: "Group booking for 15 people",
		createdAt: "2026-07-27T15:00:00Z",
	},
	{
		id: "cm-3",
		context: "contact-messages",
		name: null,
		email: "ana@example.net",
		summary: "Gift voucher?",
		createdAt: "2026-07-25T09:00:00Z",
	},
];

const qc = storyQueryClient((qc) =>
	seedTable(
		qc,
		queryKeys.contactMessages(OP),
		`/tour-operators/${OP}/contact-messages`,
		MESSAGES,
	),
);

const meta = {
	title: "Contact/AppContactMessagesList",
	component: AppContactMessagesList,
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
} satisfies Meta<typeof AppContactMessagesList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
