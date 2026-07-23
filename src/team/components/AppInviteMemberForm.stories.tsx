import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppInviteMemberForm } from "./AppInviteMemberForm";

// Connected: submits a mutation + navigates. Router + React Query come from the
// framework + preview decorator; the hook doesn't read useAuth, so no extra
// decorator is needed.
const meta = {
	title: "Team/AppInviteMemberForm",
	component: AppInviteMemberForm,
	args: { tourOperatorId: "op-1" },
} satisfies Meta<typeof AppInviteMemberForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
