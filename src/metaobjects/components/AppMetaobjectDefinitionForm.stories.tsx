import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import type { MetaobjectDefinition } from "../types";
import { AppMetaobjectDefinitionForm } from "./AppMetaobjectDefinitionForm";

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

const qc = storyQueryClient();

const meta = {
	title: "Metaobjects/AppMetaobjectDefinitionForm",
	component: AppMetaobjectDefinitionForm,
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
} satisfies Meta<typeof AppMetaobjectDefinitionForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};
export const Edit: Story = { args: { definition: DEFINITION } };
