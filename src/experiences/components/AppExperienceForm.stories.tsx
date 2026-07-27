import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { storyQueryClient } from "#/dev/story-utils";
import { AppExperienceForm } from "./AppExperienceForm";

const qc = storyQueryClient();

const meta = {
	title: "Experiences/AppExperienceForm",
	component: AppExperienceForm,
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
} satisfies Meta<typeof AppExperienceForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
