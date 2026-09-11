import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { seedTable, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { MetaobjectDefinitionListItem } from "../types";
import { AppMetaobjectDefinitionsList } from "./AppMetaobjectDefinitionsList";

const OP_ID = "op-1";

const DEFINITIONS: MetaobjectDefinitionListItem[] = [
	{
		id: "d-1",
		context: "metaobject-definitions",
		type: "guide-profile",
		name: "Guide profile",
		createdAt: "2026-07-28T10:00:00Z",
	},
	{
		id: "d-2",
		context: "metaobject-definitions",
		type: "size-chart",
		name: "Size chart",
		createdAt: "2026-07-27T09:00:00Z",
	},
];

const qc = storyQueryClient((qc) =>
	seedTable(
		qc,
		queryKeys.metaobjectDefinitions(OP_ID),
		`/tour-operators/${OP_ID}/metaobject-definitions`,
		DEFINITIONS,
	),
);

const meta = {
	title: "Metaobjects/AppMetaobjectDefinitionsList",
	component: AppMetaobjectDefinitionsList,
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
} satisfies Meta<typeof AppMetaobjectDefinitionsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
