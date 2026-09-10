import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppInviteMemberForm } from "./AppInviteMemberForm";

const meta = {
	title: "Team/AppInviteMemberForm",
	component: AppInviteMemberForm,
	args: { tourOperatorId: "op-1" },
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-3xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof AppInviteMemberForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
