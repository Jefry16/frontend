import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useForm } from "@tanstack/react-form";
import { AppComboboxField, type ComboboxItem } from "./AppComboboxField";

// A slice of the real country list — enough rows that scrolling is worse than
// typing, which is the whole reason this component exists.
const COUNTRIES: ComboboxItem[] = [
	["ES", "Spain"],
	["US", "United States"],
	["DO", "Dominican Republic"],
	["PT", "Portugal"],
	["FR", "France"],
	["IT", "Italy"],
	["DE", "Germany"],
	["GB", "United Kingdom"],
	["MX", "Mexico"],
	["AR", "Argentina"],
	["BR", "Brazil"],
	["CO", "Colombia"],
].map(([value, label]) => ({ value, label }));

const Harness = ({
	initial,
	...props
}: { initial: string } & Omit<
	React.ComponentProps<typeof AppComboboxField>,
	"field"
>) => {
	const form = useForm({ defaultValues: { countryId: initial } });
	return (
		<div className="mx-auto w-full max-w-sm">
			<form.Field name="countryId">
				{(field) => <AppComboboxField {...props} field={field} />}
			</form.Field>
		</div>
	);
};

const meta = {
	title: "Shared/AppComboboxField",
	component: Harness,
	args: {
		initial: "",
		label: "Country",
		items: COUNTRIES,
		required: true,
	},
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen — the trigger shows the placeholder. */
export const Default: Story = {};

/** A chosen country renders its NAME, though the field holds the id. */
export const Selected: Story = { args: { initial: "ES" } };

/** With a hint under it, like the address fields it sits beside. */
export const WithDescription: Story = {
	args: { description: "Used on invoices and your storefront footer." },
};
