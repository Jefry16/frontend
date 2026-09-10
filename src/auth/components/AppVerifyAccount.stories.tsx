import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppVerifyAccount } from "./AppVerifyAccount";

const meta = {
	title: "Auth/AppVerifyAccount",
	component: AppVerifyAccount,
} satisfies Meta<typeof AppVerifyAccount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Verifying: Story = { args: { state: "verifying" } };
export const Success: Story = { args: { state: "success" } };
export const Failed: Story = { args: { state: "error" } };
export const MissingToken: Story = { args: { state: "missing-token" } };
