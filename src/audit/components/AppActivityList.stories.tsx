import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { seedTable, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { AuditLogEntry } from "../types";
import { AppActivityList } from "./AppActivityList";

const OP_ID = "op-1";

const ENTRIES: AuditLogEntry[] = [
	{
		id: "a-3",
		context: "audit-log-entries",
		actorType: "USER",
		actorId: "u-1",
		actorName: "Maria Ops",
		entityType: "SLOT",
		entityId: "s-1",
		action: "slot.updated",
		details: { audiences: ["Adult", "Child"] },
		changes: [
			{ field: "capacity", from: 20, to: 15 },
			{ field: "capacity", from: 10, to: 8 },
			{ field: "status", from: "AVAILABLE", to: "SOLD_OUT" },
		],
		requestId: "req-3",
		createdAt: "2026-07-26T12:00:00Z",
	},
	{
		id: "a-2",
		context: "audit-log-entries",
		actorType: "USER",
		actorId: "u-2",
		actorName: "Jonas Guide",
		entityType: "INVITATION",
		entityId: "i-1",
		action: "member.invited",
		details: { email: "new@guide.test", role: "STAFF" },
		changes: null,
		requestId: null,
		createdAt: "2026-07-25T10:30:00Z",
	},
	{
		id: "a-1",
		context: "audit-log-entries",
		actorType: "USER",
		actorId: "u-1",
		actorName: "Maria Ops",
		entityType: "EXPERIENCE",
		entityId: "e-1",
		action: "experience.created",
		details: null,
		changes: null,
		requestId: null,
		createdAt: "2026-07-20T14:00:00Z",
	},
];

const qc = storyQueryClient();
seedTable(
	qc,
	queryKeys.activity(OP_ID),
	`/tour-operators/${OP_ID}/audit-log`,
	ENTRIES,
);

const meta = {
	title: "Audit/AppActivityList",
	component: AppActivityList,
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
} satisfies Meta<typeof AppActivityList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
