import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppTextareaField } from "./AppTextareaField";

function FieldDemo(props: {
	label: string;
	description?: string;
	rows?: number;
}) {
	const form = useForm({ defaultValues: { demo: "" } });
	return (
		<div className="w-96">
			<form.Field name="demo">
				{(field) => <AppTextareaField field={field} {...props} />}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Shared/AppTextareaField",
	component: FieldDemo,
} satisfies Meta<typeof FieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { label: "Description", description: "A short summary." },
};
export const Tall: Story = { args: { label: "Full description", rows: 6 } };
