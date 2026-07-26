import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppTimeField } from "./AppTimeField";

function FieldDemo(props: {
	label: string;
	description?: string;
	required?: boolean;
	initial?: string;
}) {
	const { initial = "", ...rest } = props;
	const form = useForm({ defaultValues: { demo: initial } });
	return (
		<div className="w-96">
			<form.Field name="demo">
				{(field) => <AppTimeField field={field} {...rest} />}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Shared/AppTimeField",
	component: FieldDemo,
} satisfies Meta<typeof FieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	args: { label: "Time", description: "The local meeting time." },
};
export const WithValue: Story = { args: { label: "Time", initial: "09:30" } };
export const OffGridMinute: Story = {
	args: { label: "Time", initial: "09:37", required: true },
};
