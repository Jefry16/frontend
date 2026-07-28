import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Metaobject, MetaobjectDefinition } from "../types";
import { AppMetaobjectDetail } from "./AppMetaobjectDetail";

const OP = "op-1";

const DEFINITION: MetaobjectDefinition = {
	id: "d-1",
	context: "metaobject-definitions" as const,
	type: "guide-profile",
	name: "Guide profile",
	description: "A guide bio card shown on tours.",
	fields: [
		{ key: "bio", type: "multi_line_text" as const, name: "Bio" },
		{
			key: "years-experience",
			type: "number_integer" as const,
			name: "Years of experience",
		},
		{ key: "certified", type: "boolean" as const, name: "Certified" },
	],
	createdAt: "2026-07-28T10:00:00Z",
	updatedAt: "2026-07-28T10:00:00Z",
};

const ENTRY: Metaobject = {
	id: "e-1",
	context: "metaobjects" as const,
	definitionId: "d-1",
	handle: "maria",
	name: "María",
	published: true,
	fields: [
		{
			key: "bio",
			type: "multi_line_text" as const,
			name: "Bio",
			value: "Kayak guide since 2014.",
		},
		{
			key: "years-experience",
			type: "number_integer" as const,
			name: "Years of experience",
			value: "12",
		},
		{
			key: "certified",
			type: "boolean" as const,
			name: "Certified",
			value: null,
		},
	],
	createdAt: "2026-07-28T10:00:00Z",
	updatedAt: "2026-07-28T10:00:00Z",
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.metaobject(OP, ENTRY.id), ENTRY);
qc.setQueryData(queryKeys.metaobjectDefinition(OP, DEFINITION.id), DEFINITION);
qc.setQueryData(
	queryKeys.activityTimeline(OP, "METAOBJECT", ENTRY.id),
	listPage([]),
);

const meta = {
	title: "Metaobjects/AppMetaobjectDetail",
	component: AppMetaobjectDetail,
	args: { tourOperatorId: OP, metaobjectId: ENTRY.id },
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
} satisfies Meta<typeof AppMetaobjectDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
