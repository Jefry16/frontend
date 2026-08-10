import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { AuditLogEntry } from "../types";
import { AppActivityLog } from "./AppActivityLog";

const OP = "op-1";
const ENTITY = "e-1";

const ENTRIES: AuditLogEntry[] = [
	{
		id: "a-3",
		context: "audit-log-entries",
		actorType: "USER",
		actorId: "u-1",
		actorName: "Maria Ops",
		entityType: "EXPERIENCE",
		entityId: ENTITY,
		action: "experience.updated",
		details: null,
		changes: [
			{ field: "name", from: "Sunset Sail", to: "Sunset Sailing Tour" },
			{ field: "bookingCutoffHours", from: 24, to: 48 },
		],
		requestId: "req-1",
		createdAt: "2026-07-25T18:30:00Z",
	},
	{
		id: "a-2",
		context: "audit-log-entries",
		actorType: "USER",
		actorId: "u-2",
		actorName: "Jonas Guide",
		entityType: "EXPERIENCE",
		entityId: ENTITY,
		action: "experience.published",
		details: null,
		changes: [{ field: "published", from: false, to: true }],
		requestId: null,
		createdAt: "2026-07-24T09:00:00Z",
	},
	{
		id: "a-1",
		context: "audit-log-entries",
		actorType: "USER",
		actorId: "u-1",
		actorName: "Maria Ops",
		entityType: "EXPERIENCE",
		entityId: ENTITY,
		action: "experience.created",
		details: null,
		changes: null,
		requestId: null,
		createdAt: "2026-07-20T14:00:00Z",
	},
];

const clientWith = (entries: AuditLogEntry[]) => {
	const qc = storyQueryClient();
	qc.setQueryData(
		queryKeys.activityTimeline(OP, "EXPERIENCE", ENTITY),
		listPage(entries),
	);
	return qc;
};

const meta = {
	title: "Audit/AppActivityLog",
	component: AppActivityLog,
	args: { tourOperatorId: OP, entityType: "EXPERIENCE", entityId: ENTITY },
} satisfies Meta<typeof AppActivityLog>;

export default meta;
type Story = StoryObj<typeof meta>;

const decorate = (entries: AuditLogEntry[]) => (Story: React.ComponentType) => (
	<QueryClientProvider client={clientWith(entries)}>
		<div className="mx-auto w-full max-w-2xl">
			<Story />
		</div>
	</QueryClientProvider>
);

export const Default: Story = { decorators: [decorate(ENTRIES)] };

export const Empty: Story = { decorators: [decorate([])] };
