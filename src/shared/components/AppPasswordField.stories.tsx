import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppPasswordField } from "./AppPasswordField";

// Binds to a live TanStack Form field, so the story renders it inside a
// throwaway form. Click the eye toggle to show/hide the value.
function PasswordDemo(props: { label: string; description?: string }) {
	const form = useForm({ defaultValues: { demo: "Password1!" } });
	return (
		<div className="w-80">
			<form.Field name="demo">
				{(field) => <AppPasswordField field={field} {...props} />}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Shared/AppPasswordField",
	component: PasswordDemo,
} satisfies Meta<typeof PasswordDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { label: "Password" },
};

export const WithDescription: Story = {
	args: {
		label: "Password",
		description: "At least 8 characters, including a number.",
	},
};
