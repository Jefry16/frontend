import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useState } from "react";
import { Field, FieldLabel } from "#/components/ui/field";
import { METAFIELD_TYPE_CODES, metafieldTypeLabel } from "../format";
import { AppTypedValueInput } from "./AppTypedValueInput";

const AllTypes = () => {
	const [values, setValues] = useState<Record<string, string>>({
		single_line_text: "Moderate",
		boolean: "true",
		date: "2026-07-28",
	});
	return (
		<div className="mx-auto flex w-full max-w-md flex-col gap-4">
			{METAFIELD_TYPE_CODES.map((code) => (
				<Field key={code}>
					<FieldLabel htmlFor={`demo-${code}`}>
						{metafieldTypeLabel(code)}
					</FieldLabel>
					<AppTypedValueInput
						inputId={`demo-${code}`}
						type={code}
						value={values[code] ?? ""}
						onValueChange={(v) => setValues((p) => ({ ...p, [code]: v }))}
					/>
				</Field>
			))}
		</div>
	);
};

const meta = {
	title: "Metafields/AppTypedValueInput",
	component: AppTypedValueInput,
	render: () => <AllTypes />,
	args: {
		inputId: "demo",
		type: "single_line_text",
		value: "",
		onValueChange: () => {},
	},
} satisfies Meta<typeof AppTypedValueInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllCatalogueTypes: Story = {};
