import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { MetafieldDefinitionListItem, MetafieldValue } from "../types";
import { AppMetafieldsCard } from "./AppMetafieldsCard";

const OP = "op-1";
const OWNER = "e-1";

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
		ownerType: "experience",
		namespace: "custom",
		key: "family-friendly",
		type: "boolean",
		metaobjectDefinitionId: null,
		name: "Family friendly",
		createdAt: "2026-07-20T10:00:00Z",
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
		createdAt: "2026-07-20T10:00:00Z",
	},
	{
		id: "d-4",
		context: "metafield-definitions",
		ownerType: "page",
		namespace: "custom",
		key: "hero-subtitle",
		type: "multi_line_text",
		metaobjectDefinitionId: null,
		name: "Hero subtitle",
		createdAt: "2026-07-20T10:00:00Z",
	},
];

const VALUES: MetafieldValue[] = [
	{
		namespace: "custom",
		key: "difficulty",
		type: "single_line_text",
		name: "Difficulty",
		value: "Moderate",
		updatedAt: "2026-07-22T10:00:00Z",
	},
	{
		namespace: "custom",
		key: "family-friendly",
		type: "boolean",
		name: "Family friendly",
		value: "true",
		updatedAt: "2026-07-22T10:00:00Z",
	},
];

const qc = storyQueryClient((qc) => {
	qc.setQueryData(
		[...queryKeys.metafieldDefinitions(OP), "all-pages"],
		listPage(DEFINITIONS),
	);
	qc.setQueryData(queryKeys.metafieldValues(OP, "experience", OWNER), VALUES);
});

const meta = {
	title: "Metafields/AppMetafieldsCard",
	component: AppMetafieldsCard,
	args: { tourOperatorId: OP, ownerType: "experience", ownerId: OWNER },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMetafieldsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
