import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { AuditLogEntry } from "../types";
import { AppActivityEntryDetail } from "./AppActivityEntryDetail";

const OP = "op-1";
const ENTRY_ID = "a-1";

const entry = (overrides: Partial<AuditLogEntry>): AuditLogEntry => ({
	id: ENTRY_ID,
	context: "audit-log-entries",
	actorType: "USER",
	actorId: "u-1",
	actorName: "Maria Ops",
	entityType: "EXPERIENCE",
	entityId: "e-1",
	action: "experience.updated",
	details: null,
	changes: [
		{ field: "name", from: "Sunset Sail", to: "Sunset Sailing Tour" },
		{ field: "tags", from: ["boat"], to: ["boat", "sunset"] },
		{ field: "thumbnailMediaId", from: null, to: "m-9" },
	],
	requestId: "req-abc123",
	createdAt: "2026-07-25T18:30:00Z",
	...overrides,
});

const clientWith = (e: AuditLogEntry) => {
	const qc = storyQueryClient();
	qc.setQueryData(queryKeys.activityEntry(OP, ENTRY_ID), e);
	return qc;
};

const meta = {
	title: "Audit/AppActivityEntryDetail",
	component: AppActivityEntryDetail,
	args: { tourOperatorId: OP, entryId: ENTRY_ID },
} satisfies Meta<typeof AppActivityEntryDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

const decorate = (e: AuditLogEntry) => (Story: React.ComponentType) => (
	<QueryClientProvider client={clientWith(e)}>
		<div className="mx-auto w-full max-w-3xl">
			<Story />
		</div>
	</QueryClientProvider>
);

export const WithChanges: Story = { decorators: [decorate(entry({}))] };

// A pure event: no field diff, identity in details instead.
export const PureEvent: Story = {
	decorators: [
		decorate(
			entry({
				action: "member.invited",
				entityType: "INVITATION",
				entityId: "i-1",
				changes: null,
				details: { email: "new@guide.test", role: "STAFF" },
			}),
		),
	],
};
