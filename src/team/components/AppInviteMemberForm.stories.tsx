import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppInviteMemberForm } from "./AppInviteMemberForm";

// Connected: submits a mutation + navigates. Router + React Query come from the
// framework + preview decorator; the hook doesn't read useAuth, so no extra
// decorator is needed.
const meta = {
	title: "Team/AppInviteMemberForm",
	component: AppInviteMemberForm,
	args: { tourOperatorId: "op-1" },
	decorators: [
		// The route owns the page wrapper in the app; mirror its width here.
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
