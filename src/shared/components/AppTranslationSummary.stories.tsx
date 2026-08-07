import type { Meta, StoryObj } from "@storybook/tanstack-react";
import * as m from "#/paraglide/messages";
import { AppTranslationSummary } from "./AppTranslationSummary";

const meta = {
	title: "Shared/AppTranslationSummary",
	component: AppTranslationSummary,
	args: {
		fields: [
			[m.name(), "Paseo en velero al atardecer"],
			[m.description(), "Dos horas de navegación con vistas a la bahía."],
			[m.slug(), "paseo-velero-atardecer"],
		],
	},
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-3xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof AppTranslationSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A fully translated locale. */
export const Default: Story = {};

/** Overlay hit and miss together — the usual case a reviewer needs to see. */
export const PartlyTranslated: Story = {
	args: {
		fields: [
			[m.name(), "Paseo en velero al atardecer"],
			[m.description(), null],
			[m.slug(), null],
		],
	},
};
