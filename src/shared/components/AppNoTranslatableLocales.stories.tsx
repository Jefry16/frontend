import type { Meta, StoryObj } from "@storybook/tanstack-react";
import * as m from "#/paraglide/messages";
import { AppNoTranslatableLocales } from "./AppNoTranslatableLocales";

const meta = {
	title: "Shared/AppNoTranslatableLocales",
	component: AppNoTranslatableLocales,
	args: { tourOperatorId: "op-1" },
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-3xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof AppNoTranslatableLocales>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ResourceSpecific: Story = {
	args: { tourOperatorId: "op-1", message: m.translations_no_languages() },
};
