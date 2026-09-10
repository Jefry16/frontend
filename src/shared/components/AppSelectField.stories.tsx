import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { SelectItem } from "#/components/ui/select";
import { AppSelectField } from "./AppSelectField";

function SelectDemo(props: { label: string; placeholder?: string }) {
	const form = useForm({ defaultValues: { demo: "" } });
	return (
		<div className="w-80">
			<form.Field name="demo">
				{(field) => (
					<AppSelectField field={field} {...props}>
						<SelectItem value="eur">EUR — Euro</SelectItem>
						<SelectItem value="usd">USD — US Dollar</SelectItem>
						<SelectItem value="dop">DOP — Dominican Peso</SelectItem>
					</AppSelectField>
				)}
			</form.Field>
		</div>
	);
}

const meta = {
	title: "Shared/AppSelectField",
	component: SelectDemo,
} satisfies Meta<typeof SelectDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { label: "Currency", placeholder: "Select a currency" },
};
