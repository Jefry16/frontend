import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppArrayInput } from "./AppArrayInput";

function FieldDemo(props: {
	label: string;
	description?: string;
	placeholder?: string;
	required?: boolean;
	initial?: string[];
}) {
	const { initial = [], ...rest } = props;
	const form = useForm({ defaultValues: { demo: initial } });
	return (
		<div className="w-96">
			<form.Field name="demo">
				{(field) => <AppArrayInput field={field} {...rest} />}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Shared/AppArrayInput",
	component: FieldDemo,
} satisfies Meta<typeof FieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	args: { label: "Tags", description: "Type an entry and press Enter." },
};

export const WithItems: Story = {
	args: {
		label: "Highlights",
		initial: ["Golden-hour light", "Small groups", "Local guide"],
	},
};

export const Required: Story = {
	args: { label: "Highlights", required: true },
};
