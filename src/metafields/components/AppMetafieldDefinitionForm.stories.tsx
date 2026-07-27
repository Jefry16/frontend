import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import type { MetafieldDefinition } from "../types";
import { AppMetafieldDefinitionForm } from "./AppMetafieldDefinitionForm";

const DEFINITION: MetafieldDefinition = {
	id: "d-1",
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

const meta = {
	title: "Metafields/AppMetafieldDefinitionForm",
	component: AppMetafieldDefinitionForm,
	args: { tourOperatorId: "op-1" },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<div className="mx-auto w-full max-w-3xl">
					<Story />
				</div>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppMetafieldDefinitionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};
export const Edit: Story = { args: { definition: DEFINITION } };
