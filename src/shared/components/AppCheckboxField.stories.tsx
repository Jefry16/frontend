import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppCheckboxField } from "./AppCheckboxField";

function FieldDemo(props: { label: string; description?: string }) {
	const form = useForm({ defaultValues: { demo: false } });
	return (
		<div className="w-96">
			<form.Field name="demo">
				{(field) => <AppCheckboxField field={field} {...props} />}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Shared/AppCheckboxField",
	component: FieldDemo,
} satisfies Meta<typeof FieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		label: "Featured",
		description: "Featured experiences are highlighted on your storefront.",
	},
};
