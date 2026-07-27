import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import { listPage, storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { MetafieldDefinition } from "../types";
import { AppMetafieldDefinitionDetail } from "./AppMetafieldDefinitionDetail";

const OP = "op-1";
const DEF = "d-1";

const DEFINITION: MetafieldDefinition = {
	id: DEF,
	context: "metafield-definitions",
	ownerType: "experience",
	namespace: "custom",
	key: "difficulty",
	type: "single_line_text",
	name: "Difficulty",
	description: "Shown on the storefront's experience card.",
	createdAt: "2026-07-20T10:00:00Z",
	updatedAt: "2026-07-22T10:00:00Z",
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.metafieldDefinition(OP, DEF), DEFINITION);
qc.setQueryData(
	queryKeys.activityTimeline(OP, "METAFIELD_DEFINITION", DEF),
	listPage([]),
);

const meta = {
	title: "Metafields/AppMetafieldDefinitionDetail",
	component: AppMetafieldDefinitionDetail,
	args: { tourOperatorId: OP, definitionId: DEF },
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
} satisfies Meta<typeof AppMetafieldDefinitionDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
