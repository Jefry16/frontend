import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppCheckboxGroupField } from "./AppCheckboxGroupField";

const DAYS = [
	{ value: 1, label: "Mon" },
	{ value: 2, label: "Tue" },
	{ value: 3, label: "Wed" },
	{ value: 4, label: "Thu" },
	{ value: 5, label: "Fri" },
	{ value: 6, label: "Sat" },
	{ value: 7, label: "Sun" },
];

const LOCALES = [
	{ value: "en", label: "English" },
	{ value: "es", label: "Spanish" },
	{ value: "fr", label: "French" },
	{ value: "de", label: "German" },
	{ value: "pt", label: "Portuguese" },
	{ value: "it", label: "Italian" },
];

function FieldDemo({
	options,
	initial,
	...props
}: {
	label: string;
	options: { value: string | number; label: string }[];
	initial: (string | number)[];
	description?: string;
	required?: boolean;
	layout?: "wrap" | "grid";
}) {
	const form = useForm({ defaultValues: { demo: initial } });
	return (
		<div className="w-96">
			<form.Field name="demo">
				{(field) => (
					<AppCheckboxGroupField field={field} options={options} {...props} />
				)}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Shared/AppCheckboxGroupField",
	component: FieldDemo,
} satisfies Meta<typeof FieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wrapping: Story = {
	args: { label: "Days", required: true, options: DAYS, initial: [1, 3, 5] },
};

export const Grid: Story = {
	args: {
		label: "Supported languages",
		description: "Every language your storefront is available in.",
		required: true,
		layout: "grid",
		options: LOCALES,
		initial: ["en", "es"],
	},
};

export const NoneSelected: Story = {
	args: { label: "Days", options: DAYS, initial: [] },
};
