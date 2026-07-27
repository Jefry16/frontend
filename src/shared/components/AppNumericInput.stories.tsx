import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useState } from "react";
import { AppNumericInput } from "./AppNumericInput";

function Demo({ decimal }: { decimal?: boolean }) {
	const [value, setValue] = useState("");
	return (
		<div className="w-40">
			<AppNumericInput
				decimal={decimal}
				value={value}
				onValueChange={setValue}
				placeholder={decimal ? "0.00" : "0"}
			/>
		</div>
	);
}

const meta = {
	title: "Shared/AppNumericInput",
	component: Demo,
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Integer: Story = {};

export const Decimal: Story = { args: { decimal: true } };
