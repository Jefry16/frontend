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

/** The default copy — used by the page, operator and name editors. */
export const Default: Story = {};

/** A caller that names what would be translated (the experience editor). */
export const ResourceSpecific: Story = {
	args: { tourOperatorId: "op-1", message: m.translations_no_languages() },
};
