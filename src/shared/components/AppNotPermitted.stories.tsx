import type { Meta, StoryObj } from "@storybook/tanstack-react";
import * as m from "#/paraglide/messages";
import { AppBackLink } from "./AppBackLink";
import { AppNotPermitted } from "./AppNotPermitted";

const meta = {
	title: "Shared/AppNotPermitted",
	component: AppNotPermitted,
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-3xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof AppNotPermitted>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithWayOut: Story = {
	args: {
		action: (
			<AppBackLink
				to="/tour-operators/$tourOperatorId/experiences"
				params={{ tourOperatorId: "op-1" }}
			>
				{m.back_to_experiences()}
			</AppBackLink>
		),
	},
};
