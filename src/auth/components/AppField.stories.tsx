import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppField } from "./AppField";

// AppField binds to a live TanStack Form field, so the story renders it inside a
// throwaway form.
function FieldDemo(props: {
	label: string;
	type?: "text" | "email" | "password";
	description?: string;
}) {
	const form = useForm({ defaultValues: { demo: "" } });
	return (
		<div className="w-80">
			<form.Field name="demo">
				{(field) => <AppField field={field} {...props} />}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Auth/AppField",
	component: FieldDemo,
} satisfies Meta<typeof FieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { label: "Email", type: "email" },
};

export const WithDescription: Story = {
	args: {
		label: "Password",
		type: "password",
		description: "At least 8 characters, including a number.",
	},
};
