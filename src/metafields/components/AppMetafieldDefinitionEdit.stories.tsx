import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { MetafieldDefinition } from "../types";
import { AppMetafieldDefinitionEdit } from "./AppMetafieldDefinitionEdit";

const OP = "op-1";
const DEF = "d-1";

const DEFINITION: MetafieldDefinition = {
	id: DEF,
	context: "metafield-definitions",
	ownerType: "page",
	namespace: "custom",
	key: "hero-subtitle",
	type: "multi_line_text",
	metaobjectDefinitionId: null,
	name: "Hero subtitle",
	description: null,
	createdAt: "2026-07-20T10:00:00Z",
	updatedAt: "2026-07-22T10:00:00Z",
};

const qc = storyQueryClient((qc) =>
	qc.setQueryData(queryKeys.metafieldDefinition(OP, DEF), DEFINITION),
);

const meta = {
	title: "Metafields/AppMetafieldDefinitionEdit",
	component: AppMetafieldDefinitionEdit,
	args: { tourOperatorId: OP, definitionId: DEF },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMetafieldDefinitionEdit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
