import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { ContactMessage } from "../types";
import { AppContactMessageDetail } from "./AppContactMessageDetail";

const OP = "op-1";
const MSG = "cm-1";

const MESSAGE: ContactMessage = {
	id: MSG,
	context: "contact-messages",
	name: "Laura Pérez",
	email: "laura@example.com",
	summary: "Do you have child seats on the sunset tour?",
	content:
		"Hi!\n\nWe are a family of four (kids are 4 and 7). Do you provide child-size life vests and seats on the Sunset Sailing Tour?\n\nThanks!",
	createdAt: "2026-07-28T10:00:00Z",
};

const qc = storyQueryClient((qc) =>
	qc.setQueryData(queryKeys.contactMessage(OP, MSG), MESSAGE),
);

const meta = {
	title: "Contact/AppContactMessageDetail",
	component: AppContactMessageDetail,
	args: { tourOperatorId: OP, messageId: MSG },
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
} satisfies Meta<typeof AppContactMessageDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
