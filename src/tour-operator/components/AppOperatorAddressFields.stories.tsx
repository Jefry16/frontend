import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { QueryClientProvider } from "@tanstack/react-query";
import { FieldGroup } from "#/components/ui/field";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import type { Country } from "#/reference";
import { AppOperatorAddressFields } from "./AppOperatorAddressFields";

const COUNTRIES: Country[] = [
	["11111111-1111-1111-1111-111111111111", "ES", "Spain"],
	["22222222-2222-2222-2222-222222222222", "US", "United States"],
	["33333333-3333-3333-3333-333333333333", "PT", "Portugal"],
].map(([id, code, name]) => ({
	id,
	context: "countries" as const,
	code,
	name,
	flagUrl: null,
}));

const qc = storyQueryClient((c) =>
	c.setQueryData(queryKeys.countries, COUNTRIES),
);

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
						countryId: "11111111-1111-1111-1111-111111111111",
					}
				: {
						address1: "",
						address2: "",
						city: "",
						province: "",
						zip: "",
						countryId: "",
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

/** Onboarding: an empty address, country unchosen. */
export const Empty: Story = {};

/** Settings → General: seeded from the stored address. */
export const Filled: Story = { args: { filled: true } };
