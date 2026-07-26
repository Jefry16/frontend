import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppDateField } from "./AppDateField";

function FieldDemo(props: {
	label: string;
	description?: string;
	required?: boolean;
	initial?: string;
	blockPast?: boolean;
}) {
	const { initial = "", blockPast, ...rest } = props;
	const form = useForm({ defaultValues: { demo: initial } });
	return (
		<div className="w-96">
			<form.Field name="demo">
				{(field) => (
					<AppDateField
						field={field}
						disabledDates={blockPast ? { before: new Date() } : undefined}
						{...rest}
					/>
				)}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Shared/AppDateField",
	component: FieldDemo,
} satisfies Meta<typeof FieldDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	args: { label: "Valid from", description: "First day departures run." },
};
export const WithValue: Story = {
	args: { label: "Valid from", initial: "2026-08-01" },
};
export const PastBlocked: Story = {
	args: { label: "Valid from", required: true, blockPast: true },
};
