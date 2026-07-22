import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppDetailField } from "./AppDetailField";

const meta = {
	title: "Shared/AppDetailField",
	component: AppDetailField,
	args: { label: "Timezone", children: "America/Santo_Domingo" },
} satisfies Meta<typeof AppDetailField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InGrid: Story = {
	render: () => (
		<dl className="grid max-w-md grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
			<AppDetailField label="Name">Acme Tours</AppDetailField>
			<AppDetailField label="Timezone">America/Santo_Domingo</AppDetailField>
			<AppDetailField label="Currency">USD</AppDetailField>
		</dl>
	),
};
