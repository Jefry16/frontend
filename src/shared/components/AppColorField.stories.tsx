import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppColorField } from "./AppColorField";

// AppColorField binds to a live TanStack Form field, so the story renders it
// inside a throwaway form.
function ColorDemo(props: {
	label: string;
	value: string;
	description?: string;
	hideLabel?: boolean;
}) {
	const { label, value, description, hideLabel } = props;
	const form = useForm({ defaultValues: { demo: value } });
	return (
		<div className="w-80">
			<form.Field name="demo">
				{(field) => (
					<AppColorField
						field={field}
						label={label}
						description={description}
						hideLabel={hideLabel}
					/>
				)}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Shared/AppColorField",
	component: ColorDemo,
} satisfies Meta<typeof ColorDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { label: "Background", value: "#0b3d5c" },
};

/** Nothing chosen yet — the swatch falls back to black rather than showing empty. */
export const Empty: Story = {
	args: { label: "Background", value: "", description: "Six-digit hex." },
};

/** A repeating row: the label stays for screen readers only. */
export const HiddenLabel: Story = {
	args: { label: "Text on it", value: "#ffffff", hideLabel: true },
};
