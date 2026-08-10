import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppNumberField } from "./AppNumberField";

function FieldDemo(props: {
	label: string;
	description?: string;
	required?: boolean;
	decimal?: boolean;
	initial?: string;
}) {
	const { initial = "", ...rest } = props;
	const form = useForm({ defaultValues: { demo: initial } });
	return (
		<div className="w-96">
			<form.Field name="demo">
				{(field) => <AppNumberField field={field} {...rest} />}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Shared/AppNumberField",
	component: FieldDemo,
} satisfies Meta<typeof FieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Integer: Story = {
	args: {
		label: "Capacity",
		description: "Seats for this tier.",
		required: true,
	},
};
export const Decimal: Story = {
	args: { label: "Price", decimal: true, initial: "49.90" },
};
