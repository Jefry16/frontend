import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { QueryClientProvider } from "@tanstack/react-query";
import { FieldGroup } from "#/components/ui/field";
import { storyQueryClient } from "#/dev/story-utils";
import { AppOperatorAddressFields } from "./AppOperatorAddressFields";

const qc = storyQueryClient();

const Harness = ({ filled }: { filled: boolean }) => {
	const form = useForm({
		defaultValues: {
			address: filled
				? {
						address1: "Calle Mayor 1",
						address2: "",
						city: "Madrid",
						province: "Madrid",
						zip: "28013",
					}
				: {
						address1: "",
						address2: "",
						city: "",
						province: "",
						zip: "",
					},
		},
	});
	return (
		<div className="mx-auto w-full max-w-2xl">
			<FieldGroup>
				<AppOperatorAddressFields form={form} />
			</FieldGroup>
		</div>
	);
};

const meta = {
	title: "TourOperator/AppOperatorAddressFields",
	component: Harness,
	args: { filled: false },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<Story />
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = { args: { filled: true } };
