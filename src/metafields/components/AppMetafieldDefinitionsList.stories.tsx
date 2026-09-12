import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { seedTable, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { MetafieldDefinitionListItem } from "../types";
import { AppMetafieldDefinitionsList } from "./AppMetafieldDefinitionsList";

const OP_ID = "op-1";

const DEFINITIONS: MetafieldDefinitionListItem[] = [
	{
		id: "d-1",
		context: "metafield-definitions",
		ownerType: "experience",
		namespace: "custom",
		key: "difficulty",
		type: "single_line_text",
		metaobjectDefinitionId: null,
		name: "Difficulty",
		createdAt: "2026-07-20T10:00:00Z",
	},
	{
		id: "d-2",
		context: "metafield-definitions",
		ownerType: "page",
		namespace: "custom",
		key: "hero-subtitle",
		type: "multi_line_text",
		metaobjectDefinitionId: null,
		name: "Hero subtitle",
		createdAt: "2026-07-22T09:00:00Z",
	},
	{
		id: "d-3",
		context: "metafield-definitions",
		ownerType: "experience",
		namespace: "specs",
		key: "max-altitude",
		type: "number_integer",
		metaobjectDefinitionId: null,
		name: "Max altitude (m)",
		createdAt: "2026-07-23T09:00:00Z",
	},
];

const qc = storyQueryClient((qc) =>
	seedTable(
		qc,
		queryKeys.metafieldDefinitions(OP_ID),
		`/tour-operators/${OP_ID}/metafield-definitions`,
		DEFINITIONS,
	),
);

const meta = {
	title: "Metafields/AppMetafieldDefinitionsList",
	component: AppMetafieldDefinitionsList,
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
} satisfies Meta<typeof AppMetafieldDefinitionsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
